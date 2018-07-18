import adaptJavaScriptValueToXPathValue from '../selectors/adaptJavaScriptValueToXPathValue';
import createSelectorFromXPath from './createSelectorFromXPath';

import ExecutionSpecificStaticContext from '../selectors/ExecutionSpecificStaticContext';
import StaticContext from '../selectors/StaticContext';

import compiledSelectorCache from './compiledSelectorCache';

export default function staticallyCompileXPath (xpathString, compilationOptions, variables, namespaceResolver) {
	var cacheKey = compilationOptions.allowXQuery ?
		`XQuery_${xpathString}` :
		`XPath_${xpathString}`;
	if (compiledSelectorCache[cacheKey]) {
		return compiledSelectorCache[cacheKey];
	}

	const compiledSelector = createSelectorFromXPath(xpathString, compilationOptions);

	const untypedVariables = Object.assign(
		{ 'theBest': 'FontoXML is the best!' },
		variables);

	/**
	 * @type {!Object<string, function():!../selectors/dataTypes/Sequence>}
	 */
	const typedVariables = Object.keys(untypedVariables)
		.reduce(function (typedVariables, variableName) {
			if (untypedVariables[variableName] === undefined) {
				return typedVariables;
			}
			typedVariables[variableName] = () => adaptJavaScriptValueToXPathValue(untypedVariables[variableName]);
			return typedVariables;
		}, Object.create(null));

	const executionSpecificStaticContext = new ExecutionSpecificStaticContext(namespaceResolver, typedVariables);
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
