import createSelectorFromXPath from './createSelectorFromXPath';

import StaticContext from '../selectors/StaticContext';

import compiledSelectorCache from './compiledSelectorCache';

export default function staticallyCompileXPath (xpathString, compilationOptions, executionSpecificStaticContext) {
	var cacheKey = compilationOptions.allowXQuery ?
		`XQuery_${xpathString}` :
		`XPath_${xpathString}`;
	if (compiledSelectorCache[cacheKey]) {
		return compiledSelectorCache[cacheKey];
	}

	const compiledSelector = createSelectorFromXPath(xpathString, compilationOptions);
	const rootStaticContext = new StaticContext(executionSpecificStaticContext);

	compiledSelector.performStaticEvaluation(rootStaticContext);

	if (executionSpecificStaticContext.executionContextWasRequired) {
		// We may not re-use this statically compiled XPath with another execution-time context because it depended on this part of information
		return compiledSelector;
	}

	// Since the static context is static, we are now sure that this statically compiled XPath can
	// be reused for other execution contexts.
	compiledSelectorCache[cacheKey] = compiledSelector;

	return compiledSelector;
}
