import ExecutionSpecificStaticContext from '../expressions/ExecutionSpecificStaticContext';
import StaticContext from '../expressions/StaticContext';
import compileAstToExpression from './compileAstToExpression';
import { enhanceStaticContextWithModule } from './globalModuleCache';
import parseExpression from './parseExpression';
import processProlog from './processProlog';

import astHelper from './astHelper';

import Expression from '../expressions/Expression';

import {
	getStaticCompilationResultFromCache,
	storeStaticCompilationResultInCache
} from './compiledExpressionCache';

export default function staticallyCompileXPath(
	xpathString: string,
	compilationOptions: {
		allowUpdating: boolean | undefined;
		allowXQuery: boolean | undefined;
		debug: boolean | undefined;
	},
	namespaceResolver: (namespace: string) => string | null,
	variables: object,
	moduleImports: object
): Expression {
	const language = compilationOptions.allowXQuery ? 'XQuery' : 'XPath';

	let fromCache = null;
	if (!compilationOptions.debug) {
		fromCache = getStaticCompilationResultFromCache(
			xpathString,
			language,
			namespaceResolver,
			variables,
			moduleImports
		);
	}

	const executionSpecificStaticContext = new ExecutionSpecificStaticContext(
		namespaceResolver,
		variables
	);
	const rootStaticContext = new StaticContext(executionSpecificStaticContext);

	let expression: Expression;

	if (fromCache !== null) {
		expression = fromCache.expression;
	} else {
		// We can not use anything from the cache, parse + compile
		const ast = parseExpression(xpathString, compilationOptions);

		const mainModule = astHelper.getFirstChild(ast, 'mainModule');
		if (!mainModule) {
			// This must be a library module
			throw new Error('Can not execute a library module.');
		}

		const prolog = astHelper.getFirstChild(mainModule, 'prolog');
		const queryBodyContents = astHelper.followPath(mainModule, ['queryBody', '*']);

		if (prolog) {
			if (!compilationOptions.allowXQuery) {
				throw new Error(
					'XPST0003: Use of XQuery functionality is not allowed in XPath context'
				);
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

		if (!compilationOptions.debug) {
			storeStaticCompilationResultInCache(
				xpathString,
				language,
				executionSpecificStaticContext,
				moduleImports,
				expression
			);
		}
	}

	return expression;
}
