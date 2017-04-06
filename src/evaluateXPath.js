import createSelectorFromXPath from './parsing/createSelectorFromXPath';
import adaptJavaScriptValueToXPathValue from './selectors/adaptJavaScriptValueToXPathValue';
import DynamicContext from './selectors/DynamicContext';
import Sequence from './selectors/dataTypes/Sequence';
import NodeValue from './selectors/dataTypes/NodeValue';
import NumericValue from './selectors/dataTypes/NumericValue';
import DomFacade from './DomFacade';
import domBackedDomFacade from './domBackedDomFacade';

/**
 * Evaluates an XPath on the given contextNode.
 * If the return type is ANY_TYPE, the returned value depends on the result of the XPath:
 *  * If the XPath evaluates to the empty sequence, an empty array is returned.
 *  * If the XPath evaluates to a singleton node, that node is returned.
 *  * If the XPath evaluates to a singleton value, that value is atomized and returned.
 *  * If the XPath evaluates to a sequence of nodes, those nodes are returned.
 *  * Else, the sequence is atomized and returned.
 *
 * @param  {!string}       xPathSelector  The selector to execute. Supports XPath 3.1.
 * @param  {!Node}         contextNode    The node from which to run the XPath.
 * @param  {?IDomFacade=}  domFacade      The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}      variables      Extra variables (name=>value). Values can be number / string or boolean.
 * @param  {?number=}      returnType     One of the return types, indicates the expected type of the XPath query.
 *
 * @return  {!Array<!Node>|Node|!Array<*>|*}
 */
function evaluateXPath (xPathSelector, contextNode, domFacade, variables = {}, returnType = evaluateXPath.ANY_TYPE) {
	if (!xPathSelector || typeof xPathSelector !== 'string' ) {
		throw new TypeError('Failed to execute \'evaluateXPath\': xPathSelector must be a string.');
	}
	if (!contextNode) {
		throw new TypeError('Failed to execute \'evaluateXPath\': contextNode must be a node.');
	}
	if (!domFacade) {
		domFacade = domBackedDomFacade;
	}

	const compiledSelector = createSelectorFromXPath(xPathSelector);
	const nestedDomFacade = new DomFacade(domFacade);
	const contextSequence = Sequence.singleton(new NodeValue(contextNode));
	const untypedVariables = Object.assign(variables || {});
	untypedVariables['theBest'] = 'FontoXML is the best!';
	/**
	 * @type {!Object}
	 */
	const typedVariables = Object.keys(untypedVariables)
		.reduce(function (typedVariables, variableName) {
			typedVariables[variableName] = adaptJavaScriptValueToXPathValue(untypedVariables[variableName]);
			return typedVariables;
		}, Object.create(null));

	/**
	 * @type {!DynamicContext}
	 */
	const dynamicContext = new DynamicContext({
		contextItemIndex: 0,
		contextSequence: contextSequence,
		domFacade: nestedDomFacade,
		variables: typedVariables
	});

	const rawResults = compiledSelector.evaluate(dynamicContext);

	switch (returnType) {
		case evaluateXPath.BOOLEAN_TYPE:
			return rawResults.getEffectiveBooleanValue();

		case evaluateXPath.STRING_TYPE:
			if (rawResults.isEmpty()) {
				return '';
			}
			// Atomize to convert (attribute)nodes to be strings
			return rawResults.value[0].atomize(dynamicContext).value + '';

		case evaluateXPath.STRINGS_TYPE:
			if (rawResults.isEmpty()) {
				return [];
			}

			// Atomize all parts
			return rawResults.value.map(function (value) {
				return value.atomize(dynamicContext).value + '';
			});

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
			if (!(rawResults.value.every(function (value) {
				return value.instanceOfType('node()');
			}))) {
				throw new Error('Expected XPath ' + xPathSelector + ' to resolve to a sequence of Nodes.');
			}
			if (rawResults.value.some(function (value) {
				return value.instanceOfType('attribute()');
			})) {
				throw new Error('XPath ' + xPathSelector + ' should not resolve to attribute nodes');
			}
			return rawResults.value.map(function (nodeValue) {
				return nodeValue.value;
			});

		case evaluateXPath.MAP_TYPE:
			if (rawResults.isEmpty()) {
				return {};
			}
			if (!rawResults.isSingleton()) {
				throw new Error('Expected XPath ' + xPathSelector + ' to resolve to a single map.');
			}
			if (!(rawResults.value[0].instanceOfType('map(*)'))) {
				throw new Error('Expected XPath ' + xPathSelector + ' to resolve to a map');
			}
			return rawResults.value[0].keyValuePairs.reduce(function (mapObject, keyValuePair) {
				var key = keyValuePair.key.value;
				var value;
				if (keyValuePair.value.isSingleton()) {
					value = keyValuePair.value.value[0].atomize(dynamicContext).value;
				}
				else {
					value = keyValuePair.value.atomize(dynamicContext).value.map(function (atomizedValue) {
						return atomizedValue.value;
					});
				}
				mapObject[key] = value;
				return mapObject;
			}, {});

		case evaluateXPath.ARRAY_TYPE:
			if (rawResults.isEmpty()) {
				return {};
			}
			if (!rawResults.isSingleton()) {
				throw new Error('Expected XPath ' + xPathSelector + ' to resolve to a single array.');
			}
			if (!(rawResults.value[0].instanceOfType('array(*)'))) {
				throw new Error('Expected XPath ' + xPathSelector + ' to resolve to an array');
			}
			return rawResults.value[0].members.map(function (entry) {
				return entry.atomize(dynamicContext).value.map(function (atomizedValue) {
					return atomizedValue.value;
				});
			});

		case evaluateXPath.NUMBERS_TYPE:
			if (rawResults.isEmpty()) {
				return [];
			}
			return rawResults.value.map(function (value) {
				if (!(value instanceof NumericValue)) {
					throw new Error('Expected XPath ' + xPathSelector + ' to resolve to numbers');
				}
				return value.value;
			});

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
				return rawResults.value[0].atomize(dynamicContext).value;
			}
			return rawResults.atomize(dynamicContext).value.map(function (atomizedValue) {
				return atomizedValue.value;
			});
	}
}

/**
 * Returns the result of the query, can be anything depending on the query
 */
evaluateXPath['ANY_TYPE'] = evaluateXPath.ANY_TYPE = 0;

/**
 * Resolve to a number, like count((1,2,3)) resolves to 3.
 */
evaluateXPath['NUMBER_TYPE'] = evaluateXPath.NUMBER_TYPE = 1;

/**
 * Resolve to a string, like //someElement[1] resolves to the text content of the first someElement
 */
evaluateXPath['STRING_TYPE'] = evaluateXPath.STRING_TYPE = 2;

/**
 * Resolves to true or false, uses the effective boolean value to determin result. count(1) resolves to true, count(()) resolves to false
 */
evaluateXPath['BOOLEAN_TYPE'] = evaluateXPath.BOOLEAN_TYPE = 3;

/**
 * Resolve to all nodes the XPath resolves to. Returns nodes in the order the XPath would. Meaning (//a, //b) resolves to all A nodes, followed by all B nodes. //*[self::a or self::b] resolves to A and B nodes in document order.
 */
evaluateXPath['NODES_TYPE'] = evaluateXPath.NODES_TYPE = 7;

/**
 * Resolves to the first node.NODES_TYPE would have resolved to.
 */
evaluateXPath['FIRST_NODE_TYPE'] = evaluateXPath.FIRST_NODE_TYPE = 9;

/**
 * Resolve to an array of strings
 */
evaluateXPath['STRINGS_TYPE'] = evaluateXPath.STRINGS_TYPE = 10;

/**
 * Resolve to an object, as a map
 */
evaluateXPath['MAP_TYPE'] = evaluateXPath.MAP_TYPE = 11;

evaluateXPath['ARRAY_TYPE'] = evaluateXPath.ARRAY_TYPE = 12;

/**
 * Resolve to an array of numbers
 */
evaluateXPath['NUMBERS_TYPE'] = evaluateXPath.NUMBERS_TYPE = 13;

export default evaluateXPath;
