import createExpressionFromXPath from './createExpressionFromXPath';
import { enhanceStaticContextWithModule } from '../globalModuleCache';
import StaticContext from '../expressions/StaticContext';
import ExecutionSpecificStaticContext from '../expressions/ExecutionSpecificStaticContext';

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

	const compiledExpression = createExpressionFromXPath(xpathString, compilationOptions);
	const rootStaticContext = new StaticContext(executionSpecificStaticContext);

	Object.keys(moduleImports).forEach(modulePrefix => {
		const moduleURI = moduleImports[modulePrefix];
		enhanceStaticContextWithModule(rootStaticContext, moduleURI);

		rootStaticContext.registerNamespace(modulePrefix, moduleURI);
	});

	compiledExpression.performStaticEvaluation(rootStaticContext);

	storeStaticCompilationResultInCache(xpathString, language, executionSpecificStaticContext, moduleImports, compiledExpression);

	return compiledExpression;
}
