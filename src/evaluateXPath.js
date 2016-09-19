define([
	'./parsing/createSelectorFromXPath',
	'./selectors/adaptJavaScriptValueToXPathValue',
	'./selectors/DynamicContext',
	'./selectors/dataTypes/Sequence',
	'./selectors/dataTypes/NodeValue',
	'./selectors/dataTypes/NumericValue',
	'./DomFacade'
], function (
	createSelectorFromXPath,
	adaptJavaScriptValueToXPathValue,
	DynamicContext,
	Sequence,
	NodeValue,
	NumericValue,
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
	 *
	 * @param  {Selector|String}   XPathSelector  The selector to execute. Supports XPath 3.1.
	 * @param  {Node}              contextNode    The node from which to run the XPath.
	 * @param  {Blueprint}         blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
	 * @param  {[Object]}          variables      Extra variables (name=>value). Values can be number / string or boolean.
	 * @param  {[Number]}          returnType     One of the return types, indicates the expected type of the XPath query.
	 *
	 * @return  {Node[]|Node|Any[]|Any}
	 */
	function evaluateXPath (xPathSelector, contextNode, blueprint, variables, returnType) {
		returnType = returnType || evaluateXPath.ANY_TYPE;
		if (typeof xPathSelector === 'string') {
			xPathSelector = createSelectorFromXPath(xPathSelector);
		}
		var domFacade = new DomFacade(blueprint),
			contextSequence = Sequence.singleton(new NodeValue(domFacade, contextNode)),
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

			case evaluateXPath.STRINGS_TYPE:
				if (rawResults.isEmpty()) {
					return [];
				}

				// Atomize all parts
				return rawResults.value.map(function (value) { return value.atomize().value; });

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
				if (!(rawResults.value[0].instanceOfType('node()'))) {
					throw new Error('Expected XPath ' + xPathSelector + ' to resolve to Node. Got ' + rawResults.value[0]);
				}
				if (rawResults.value[0].instanceOfType('attribute()')) {
					throw new Error('XPath can not resolve to attribute nodes');
				}
				return rawResults.value[0].value;

			case evaluateXPath.NODES_TYPE:
				if (rawResults.isEmpty()) {
					return [];
				}
				if (!(rawResults.value.every(function (value) {return value.instanceOfType('node()');}))) {
					throw new Error('Expected XPath ' + xPathSelector + ' to resolve to a sequence of Nodes.');
				}
				if (rawResults.value.some(function (value) {return value.instanceOfType('attribute()');})) {
					throw new Error('XPath ' + xPathSelector + ' should not resolve to attribute nodes');
				}
				return rawResults.value.map(function (nodeValue) { return nodeValue.value;});

			default:
				var allValuesAreNodes = rawResults.value.every(function (value) {
						return value.instanceOfType('node()') &&
							!(value.instanceOfType('attribute()'));
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

	/**
	 * Returns the result of the query, can be anything depending on the query
	 */
	evaluateXPath.ANY_TYPE = 0;

	/**
	 * Resolve to a number, like count((1,2,3)) resolves to 3.
	 */
	evaluateXPath.NUMBER_TYPE = 1;

	/**
	 * Resolve to a string, like //someElement[1] resolves to the text content of the first someElement
	 */
	evaluateXPath.STRING_TYPE = 2;

	/**
	 * Resolves to true or false, uses the effective boolean value to determin result. count(1) resolves to true, count(()) resolves to false
	 */
	evaluateXPath.BOOLEAN_TYPE = 3;

	/**
	 * Resolve to all nodes the XPath resolves to. Returns nodes in the order the XPath would. Meaning (//a, //b) resolves to all A nodes, followed by all B nodes. //*[self::a or self::b] resolves to A and B nodes in document order.
	 */
	evaluateXPath.NODES_TYPE = 7;

	/**
	 * Resolves to the first node NODES_TYPE would have resolved to.
	 */
	evaluateXPath.FIRST_NODE_TYPE = 9;

	/**
	 * Resolve to an array of strings
	 */
	evaluateXPath.STRINGS_TYPE = 10;

	return evaluateXPath;
});
