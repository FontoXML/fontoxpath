define([
	'./adaptJavaScriptValueToXPathValue',
	'./selectors/DynamicContext',
	'./selectors/dataTypes/Sequence',
	'./selectors/dataTypes/NodeValue'
], function (
	adaptJavaScriptValueToXPathValue,
	DynamicContext,
	Sequence,
	NodeValue
) {
	'use strict';

	/**
	 * Evaluates an XPath on the given contextNode.
	 * The return value depends on the result of the XPath:
	 *  * If the XPath evaluates to the empty sequence, an empty array is returned.
	 *  * If the XPath evaluates to a singleton node, that node is returned.
	 *  * If the XPath evaluates to a singleton value, that value is atomized and returned.
	 *  * If the XPath evaluates to a sequence of nodes, those nodes are returned.
	 *  * Else, the sequence is atomized and returned.
	 * @param  {Selector}   XPathSelector
	 * @param  {Node}       contextNode
	 * @param  {Blueprint}  blueprint
	 * @param  {[Object]}   variables
	 *
	 *@return  {Node[]|Node|Any[]|Any}
	 */
	function evaluateXPath (xPathSelector, contextNode, blueprint, variables, returnType) {
		var contextSequence = Sequence.singleton(new NodeValue(contextNode, blueprint));
		var untypedVariables = Object.assign(
				{
					'theBest': 'FontoXML is the best!'
				},
				variables || {});
		var typedVariables = Object.keys(untypedVariables).reduce(function (typedVariables, variableName) {
				typedVariables[variableName] = adaptJavaScriptValueToXPathValue(untypedVariables[variableName]);
				return typedVariables;
			}, Object.create(null));

		var rawResults = xPathSelector.evaluate(new DynamicContext({
				contextItem: contextSequence,
				blueprint: blueprint,
				variables: typedVariables
			}));

		if (rawResults.isEmpty()) {
			return [];
		}

		if (rawResults.isSingleton() && !(rawResults.value[0] instanceof NodeValue)) {
			return rawResults.value[0].value;
		}

		var allValuesAreNodes = rawResults.value.every(function (value) {
				return value instanceof NodeValue;
			});

		if (allValuesAreNodes) {
			return rawResults.value.map(function (value) {
				return value._node;
			});
		}

		return rawResults.atomize().value.map(function (atomizedValue) {
			return atomizedValue.value;
		});
	}

	evaluateXPath.BOOLEAN_TYPE = {};
	evaluateXPath.ANY_TYPE = {};
	evaluateXPath.NUMBER_TYPE = {};
	evaluateXPath.NODE_TYPE = {};
	evaluateXPath.NODES_TYPE = {};

	return evaluateXPath;
});
