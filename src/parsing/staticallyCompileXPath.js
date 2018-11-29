import parseExpression from './parseExpression';
import { enhanceStaticContextWithModule } from './globalModuleCache';
import StaticContext from '../expressions/StaticContext';
import ExecutionSpecificStaticContext from '../expressions/ExecutionSpecificStaticContext';
import compileAstToExpression from './compileAstToExpression';
import processProlog from './processProlog';

import astHelper from './astHelper';

import Expression from '../expressions/Expression';

import {
	getStaticCompilationResultFromCache,
	storeStaticCompilationResultInCache
} from './compiledExpressionCache';

/**
 * @param  {string}  xpathString
 * @param  {!{allowXQuery: (boolean|undefined), disableCache: (boolean|undefined), allowUpdating: (boolean|undefined)}}  compilationOptions
 * @param  {function(string):?string} namespaceResolver
 * @param  {!Object}  variables
 * @param  {!Object} moduleImports
 *
 * @return  {!Expression}
 */
export default function staticallyCompileXPath (xpathString, compilationOptions, namespaceResolver, variables, moduleImports) {
	const language = compilationOptions.allowXQuery ? 'XQuery' : 'XPath';

	let fromCache = null;
	if (!compilationOptions.disableCache) {
		fromCache = getStaticCompilationResultFromCache(
			xpathString,
			language,
			namespaceResolver,
			variables,
			moduleImports);
	}

	const executionSpecificStaticContext = new ExecutionSpecificStaticContext(
		namespaceResolver,
		variables);
	const rootStaticContext = new StaticContext(executionSpecificStaticContext);

	let expression;

	if (fromCache !== null) {
		expression = fromCache.expression;
	} else {
		// We can not use anything from the cache, parse + compile
		const ast = parseExpression(xpathString, compilationOptions);

		const mainModule = astHelper.getFirstChild(ast, 'mainModule');
		const prolog = astHelper.getFirstChild(mainModule, 'prolog');
		const queryBodyContents = astHelper.followPath(mainModule, ['queryBody', '*']);
		if (!queryBodyContents) {
			// This must be a library module
			throw new Error('Can not execute a library module.');
		}

		if (prolog) {
			if (!compilationOptions.allowXQuery) {
				throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
			}
			processProlog(prolog, rootStaticContext);
		}

		expression = compileAstToExpression(queryBodyContents, compilationOptions);
	}

	if (fromCache === null || fromCache.requiresStaticCompilation) {
		Object.keys(moduleImports).forEach(modulePrefix => {
			const moduleURI = moduleImports[modulePrefix];
			enhanceStaticContextWithModule(rootStaticContext, moduleURI);

			rootStaticContext.registerNamespace(modulePrefix, moduleURI);
		});

		expression.performStaticEvaluation(rootStaticContext);

		storeStaticCompilationResultInCache(
			xpathString,
			language,
			executionSpecificStaticContext,
			moduleImports,
			expression);
	}

	return expression;
}
