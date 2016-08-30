define([
	'./parsing/createSelectorFromXPath',
	'./adaptJavaScriptValueToXPathValue',
	'./selectors/DynamicContext',
	'./selectors/dataTypes/Sequence',
	'./selectors/dataTypes/NodeValue',
	'./selectors/dataTypes/NumericValue',
	'./selectors/dataTypes/AttributeNodeValue',
	'./selectors/DomFacade'
], function (
	createSelectorFromXPath,
	adaptJavaScriptValueToXPathValue,
	DynamicContext,
	Sequence,
	NodeValue,
	NumericValue,
	AttributeNodeValue,
	DomFacade
) {
	'use strict';

	/**
	 * Evaluates an XPath on the given contextNode.
	 * If the return type is ANY_TYPE, the returned value depends on the result of the XPath:
	 *  * If the XPath evaluates to the empty sequence, an empty array is returned.
	 *  * If the XPath evaluates to a singleton node, that node is returned.
	 *  * If the XPath evaluates to a singleton value, that value is atomized and returned.
	 *  * If the XPath evaluates to a sequence of nodes, those nodes are returned.
	 *  * Else, the sequence is atomized and returned.
	 * @param  {Selector|String}   XPathSelector
	 * @param  {Node}              contextNode
	 * @param  {Blueprint}         blueprint
	 * @param  {[Object]}          variables
	 *
	 *@return  {Node[]|Node|Any[]|Any}
	 */
	function evaluateXPath (xPathSelector, contextNode, blueprint, variables, returnType) {
		returnType = returnType || evaluateXPath.ANY_TYPE;
		if (typeof xPathSelector === 'string') {
			xPathSelector = createSelectorFromXPath(xPathSelector);
		}
		var domFacade = new DomFacade(blueprint),
			contextSequence = Sequence.singleton(domFacade.importNode(contextNode)),
			untypedVariables = Object.assign(
				{
					'theBest': 'FontoXML is the best!'
				},
				variables || {});
		var typedVariables = Object.keys(untypedVariables).reduce(function (typedVariables, variableName) {
				typedVariables[variableName] = adaptJavaScriptValueToXPathValue(untypedVariables[variableName]);
				return typedVariables;
			}, Object.create(null));

		var dynamicContext = new DynamicContext({
				contextItem: contextSequence,
				domFacade: domFacade,
				variables: typedVariables
			});

		var rawResults = xPathSelector.evaluate(dynamicContext);

		switch (returnType) {
			case evaluateXPath.BOOLEAN_TYPE:
				return rawResults.getEffectiveBooleanValue();
			case evaluateXPath.STRING_TYPE:
				if (rawResults.isEmpty()) {
					return '';
				}
				// Atomize to convert (attribute)nodes to be strings
				return rawResults.value[0].atomize().value;
			case evaluateXPath.NUMBER_TYPE:
				if (!rawResults.isSingleton()) {
					return NaN;
				}
				if (!(rawResults.value[0] instanceof NumericValue)) {
					return NaN;
				}
				return rawResults.value[0].value;
			case evaluateXPath.FIRST_NODE_TYPE:
				if (rawResults.isEmpty()) {
					return null;
				}
				if (!(rawResults.value[0] instanceof NodeValue)) {
					throw new Error('Expected XPath ' + xPathSelector + ' to resolve to Node. Got ' + rawResults.value[0]);
				}
				if (rawResults.value[0] instanceof AttributeNodeValue) {
					throw new Error('XPath can not resolve to attribute nodes');
				}
				return rawResults.value[0].value;
			case evaluateXPath.NODES_TYPE:
				if (rawResults.isEmpty()) {
					return [];
				}
				if (!(rawResults.value.every(function (value) {return value instanceof NodeValue;}))) {
					throw new Error('Expected XPath ' + xPathSelector + ' to resolve to a sequence of Nodes.');
				}
				if (rawResults.value.some(function (value) {return value instanceof AttributeNodeValue;})) {
					throw new Error('XPath ' + xPathSelector + ' should not resolve to attribute nodes');
				}
				return rawResults.value.map(function (nodeValue) { return nodeValue.value;});
			default:
				var allValuesAreNodes = rawResults.value.every(function (value) {
						return value instanceof NodeValue &&
							!(value instanceof AttributeNodeValue);
					});
				if (allValuesAreNodes) {
					if (rawResults.isSingleton()) {
						return rawResults.value[0].value;
					}
					return rawResults.value.map(function (nodeValue) {
						return nodeValue.value;
					});
				}
				if (rawResults.isSingleton()) {
					return rawResults.value[0].atomize().value;
				}
				return rawResults.atomize().value.map(function (atomizedValue) {
					return atomizedValue.value;
				});
		}
	}

	evaluateXPath.ANY_TYPE = 0;
	evaluateXPath.NUMBER_TYPE = 1;
	evaluateXPath.STRING_TYPE = 2;
	evaluateXPath.BOOLEAN_TYPE = 3;
	evaluateXPath.NODES_TYPE = 7;
	evaluateXPath.FIRST_NODE_TYPE = 9;

	return evaluateXPath;
});
