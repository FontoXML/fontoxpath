import createExpressionFromXPath from './createExpressionFromXPath';

import StaticContext from '../expressions/StaticContext';
import ExecutionSpecificStaticContext from '../expressions/ExecutionSpecificStaticContext';

import {
	getStaticCompilationResultFromCache,
	storeStaticCompilationResultInCache
} from './compiledExpressionCache';

export default function staticallyCompileXPath (xpathString, compilationOptions, namespaceResolver, variables) {
	const language = compilationOptions.allowXQuery ? `XQuery` : `XPath`;

	const executionSpecificStaticContext = new ExecutionSpecificStaticContext(namespaceResolver, variables);

	const fromCache = getStaticCompilationResultFromCache(xpathString, language, namespaceResolver, variables);

	if (fromCache) {
		return fromCache;
	}

	const compiledExpression = createExpressionFromXPath(xpathString, compilationOptions);
	const rootStaticContext = new StaticContext(executionSpecificStaticContext);

	compiledExpression.performStaticEvaluation(rootStaticContext);

	storeStaticCompilationResultInCache(xpathString, language, executionSpecificStaticContext, compiledExpression);

	return compiledExpression;
}
