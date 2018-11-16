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
 * @param  {!{allowXQuery: boolean, disableCache: boolean, allowUpdating: boolean}}  compilationOptions
 * @param  {function(string):?string} namespaceResolver
 * @param  {!Object}  variables
 * @param  {!Object} moduleImports
 *
 * @return  {!Expression}
 */
export default function staticallyCompileXPath (xpathString, compilationOptions, namespaceResolver, variables, moduleImports) {
	const language = compilationOptions.allowXQuery ? `XQuery` : `XPath`;

	const executionSpecificStaticContext = new ExecutionSpecificStaticContext(namespaceResolver, variables);

	if (!compilationOptions.disableCache) {
		const fromCache = getStaticCompilationResultFromCache(xpathString, language, namespaceResolver, variables, moduleImports);

		if (fromCache) {
			return fromCache;
		}
	}

	const ast = parseExpression(xpathString, compilationOptions);

	const mainModule = astHelper.getFirstChild(ast, 'mainModule');
	const prolog = astHelper.getFirstChild(mainModule, 'prolog');
	const queryBodyContents = astHelper.followPath(mainModule, ['queryBody', '*']);
	if (!queryBodyContents) {
		// This must be a library module
		throw new Error('Can not execute a library module.');
	}

	const rootStaticContext = new StaticContext(executionSpecificStaticContext);

	if (prolog) {
		if (!compilationOptions.allowXQuery) {
			throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
		}
		processProlog(prolog, rootStaticContext);
	}

	const compiledExpression = compileAstToExpression(queryBodyContents, compilationOptions);

	Object.keys(moduleImports).forEach(modulePrefix => {
		const moduleURI = moduleImports[modulePrefix];
		enhanceStaticContextWithModule(rootStaticContext, moduleURI);

		rootStaticContext.registerNamespace(modulePrefix, moduleURI);
	});

	compiledExpression.performStaticEvaluation(rootStaticContext);

	storeStaticCompilationResultInCache(
		xpathString,
		language,
		executionSpecificStaticContext,
		moduleImports,
		compiledExpression);

	return compiledExpression;
}
