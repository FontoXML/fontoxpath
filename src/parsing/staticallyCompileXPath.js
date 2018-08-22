import parseExpression from './parseExpression';
import { enhanceStaticContextWithModule } from './globalModuleCache';
import StaticContext from '../expressions/StaticContext';
import ExecutionSpecificStaticContext from '../expressions/ExecutionSpecificStaticContext';
import compileAstToExpression from './compileAstToExpression';
import processProlog from './processProlog';
import Expression from '../expressions/Expression';

import {
	getStaticCompilationResultFromCache,
	storeStaticCompilationResultInCache
} from './compiledExpressionCache';

export default function staticallyCompileXPath (xpathString, compilationOptions, namespaceResolver, variables, moduleImports) {
	const language = compilationOptions.allowXQuery ? `XQuery` : `XPath`;

	const executionSpecificStaticContext = new ExecutionSpecificStaticContext(namespaceResolver, variables);

	const fromCache = getStaticCompilationResultFromCache(xpathString, language, namespaceResolver, variables, moduleImports);

	if (fromCache) {
		return fromCache;
	}

	const ast = parseExpression(xpathString, compilationOptions);

	if (ast['type'] === 'libraryModule') {
		throw new Error('Can not execute a library module.');
	}

	const prolog = ast['prolog'];
	const moduleBody = ast['body'];
	const rootStaticContext = new StaticContext(executionSpecificStaticContext);

	if (compilationOptions.allowXQuery) {
		processProlog(prolog, rootStaticContext);
	} else if (ast['prolog']['moduleSettings'].length || ast['prolog']['declarations'].length) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}

	const compiledExpression = compileAstToExpression(moduleBody, compilationOptions);

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
