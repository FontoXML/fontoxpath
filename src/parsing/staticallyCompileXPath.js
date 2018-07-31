import createSelectorFromXPath from './createSelectorFromXPath';

import StaticContext from '../selectors/StaticContext';
import ExecutionSpecificStaticContext from '../selectors/ExecutionSpecificStaticContext';

import {
	getStaticCompilationResultFromCache,
	storeStaticCompilationResultInCache
} from './compiledSelectorCache';

export default function staticallyCompileXPath (xpathString, compilationOptions, namespaceResolver, variables) {
	const language = compilationOptions.allowXQuery ? `XQuery` : `XPath`;

	const executionSpecificStaticContext = new ExecutionSpecificStaticContext(namespaceResolver, variables);

	const fromCache = getStaticCompilationResultFromCache(xpathString, language, namespaceResolver, variables);

	if (fromCache) {
		return fromCache;
	}

	const compiledSelector = createSelectorFromXPath(xpathString, compilationOptions);
	const rootStaticContext = new StaticContext(executionSpecificStaticContext);

	compiledSelector.performStaticEvaluation(rootStaticContext);

	storeStaticCompilationResultInCache(xpathString, language, executionSpecificStaticContext, compiledSelector);

	return compiledSelector;
}
