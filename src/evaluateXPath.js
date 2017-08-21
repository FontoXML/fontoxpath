import createSelectorFromXPath from './parsing/createSelectorFromXPath';
import adaptJavaScriptValueToXPathValue from './selectors/adaptJavaScriptValueToXPathValue';
import DynamicContext from './selectors/DynamicContext';
import DomFacade from './DomFacade';
import domBackedDomFacade from './domBackedDomFacade';

import atomize from './selectors/dataTypes/atomize';
import castToType from './selectors/dataTypes/castToType';
import Sequence from './selectors/dataTypes/Sequence';
import isSubtypeOf from './selectors/dataTypes/isSubtypeOf';

const DEFAULT_NAMESPACES = {
	'xml': 'http://www.w3.org/XML/1998/namespace',
	'xs': 'http://www.w3.org/2001/XMLSchema',
	'fn': 'http://www.w3.org/2005/xpath-functions',
	'map': 'http://www.w3.org/2005/xpath-functions/map',
	'array': 'http://www.w3.org/2005/xpath-functions/array',
	'math': 'http://www.w3.org/2005/xpath-functions/math'
};

function transformMapToObject (map, dynamicContext) {
	const mapObj = {};
	let i = 0;
	let done = false;
	let transformedValueIterator = null;
	return {
		next: () => {
			if (done) {
				return { done: true, ready: true, value: undefined };
			}
			while (i < map.keyValuePairs.length) {
				if (!transformedValueIterator) {
					const val = map.keyValuePairs[i].value
						.switchCases({
							default: seq => seq,
							multiple: () => {
								throw new Error('Serialization error: The value of an entry in a map is expected to be a singleton sequence.');
							}
						})
						.tryGetFirst();
					if (!val.ready) {
						return { done: false, ready: false, promise: val.promise };
					}
					transformedValueIterator = transformXPathItemToJavascriptObject(val.value, dynamicContext);
				}
				const transformedValue = transformedValueIterator.next();
				if (!transformedValue.ready) {
					return transformedValue;
				}
				transformedValueIterator = null;
				mapObj[map.keyValuePairs[i].key.value] = transformedValue.value;
				i++;
			}
			done = true;
			return { done: false, ready: true, value: mapObj };
		}
	};
}

function transformArrayToArray (array, dynamicContext) {
	const arr = [];
	let i = 0;
	let done = false;
	let transformedMemberGenerator = null;
	return {
		next: () => {
			if (done) {
				return { done: true, ready: true, value: undefined };
			}
			while (i < array.members.length) {
				if (!transformedMemberGenerator) {
					const val = array.members[i]
						.switchCases({
							default: seq => seq,
							multiple: () => {
								throw new Error('Serialization error: The value of an entry in an array is expected to be a singleton sequence.');
							}
						})
						.tryGetFirst();
					if (!val.ready) {
						return { done: false, ready: false, promise: val.promise };
					}
					transformedMemberGenerator = transformXPathItemToJavascriptObject(val.value, dynamicContext);
				}
				const transformedValue = transformedMemberGenerator.next();
				if (!transformedValue.ready) {
					return transformedValue;
				}
				transformedMemberGenerator = null;
				arr[i++] = transformedValue.value;
			}
			done = true;
			return { done: false, ready: true, value: arr };
		}
	};
}

function transformXPathItemToJavascriptObject (value, dynamicContext) {
	if (isSubtypeOf(value.type, 'map(*)')) {
		return transformMapToObject(value, dynamicContext);
	}
	if (isSubtypeOf(value.type, 'array(*)')) {
		return transformArrayToArray(value, dynamicContext);
	}
	return {
		next: () => ({
			done: false,
			ready: true,
			value: value.value
		})
	};
}
/**
 * @param   {Node|*}  contextItem
 * @return  {function(string):?string}
 */
function createDefaultNamespaceResolver (contextItem) {
	if (!contextItem || typeof contextItem !== 'object' || !('lookupNamespaceURI' in contextItem)) {
		return (_prefix) => null;
	}
	return prefix => (/** @type {Node} */(contextItem)).lookupNamespaceURI(prefix || null);
}

/**
 * Evaluates an XPath on the given contextItem.
 * If the return type is ANY_TYPE, the returned value depends on the result of the XPath:
 *  * If the XPath evaluates to the empty sequence, an empty array is returned.
 *  * If the XPath evaluates to a singleton node, that node is returned.
 *  * If the XPath evaluates to a singleton value, that value is atomized and returned.
 *  * If the XPath evaluates to a sequence of nodes, those nodes are returned.
 *  * Else, the sequence is atomized and returned.
 *
 * @param  {!string}       xpathSelector  The selector to execute. Supports XPath 3.1.
 * @param  {Node|*|null}   contextItem    The node from which to run the XPath.
 * @param  {?IDomFacade=}  domFacade      The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}      variables      Extra variables (name=>value). Values can be number / string or boolean.
 * @param  {?number=}      returnType     One of the return types, indicates the expected type of the XPath query.
 * @param  {?{namespaceResolver: ?function(string):string?}=}      options        Extra options for evaluating this XPath
 *
 * @return  {!Array<!Node>|Node|!Array<*>|*}
 */
function evaluateXPath (xpathSelector, contextItem, domFacade, variables = {}, returnType = evaluateXPath.ANY_TYPE, options = { namespaceResolver: null }) {
	if (!xpathSelector || typeof xpathSelector !== 'string' ) {
		throw new TypeError('Failed to execute \'evaluateXPath\': xpathSelector must be a string.');
	}
	if (!domFacade) {
		domFacade = domBackedDomFacade;
	}
	else {
		domFacade = new DomFacade(domFacade);
	}

	const compiledSelector = createSelectorFromXPath(xpathSelector);

	const contextSequence = contextItem ? adaptJavaScriptValueToXPathValue(contextItem) : Sequence.empty();

	const untypedVariables = Object.assign(variables || {});
	untypedVariables['theBest'] = 'FontoXML is the best!';

	const namespaceResolver = options['namespaceResolver'] || createDefaultNamespaceResolver(contextItem);

	/**
	 * @type {!Object}
	 */
	const typedVariables = Object.keys(untypedVariables)
		.reduce(function (typedVariables, variableName) {
			typedVariables[variableName] = () => adaptJavaScriptValueToXPathValue(untypedVariables[variableName]);
			return typedVariables;
		}, Object.create(null));

	/**
	 * @type {!DynamicContext}
	 */
	const dynamicContext = new DynamicContext({
		contextItemIndex: 0,
		contextSequence: contextSequence,
		contextItem: contextSequence.first(),
		domFacade,
		variables: typedVariables,
		resolveNamespacePrefix: prefix => {
			if (DEFAULT_NAMESPACES[prefix]) {
				return DEFAULT_NAMESPACES[prefix];
			}
			return namespaceResolver(prefix);
		},
		// propagate the compiler here
		createSelectorFromXPath: createSelectorFromXPath
	});

	/**
	 * @type {!./selectors/dataTypes/Sequence}
	 */
	const rawResults = compiledSelector.evaluateMaybeStatically(dynamicContext);

	switch (returnType) {
		case evaluateXPath.BOOLEAN_TYPE: {
			const ebv = rawResults.tryGetEffectiveBooleanValue();
			if (!ebv.ready) {
				throw new Error(`The XPath ${xpathSelector} can not be resolved synchronously.`);
			}
			return ebv.value;
		}

		case evaluateXPath.STRING_TYPE: {
			const allValues = rawResults.tryGetAllValues();
			if (!allValues.ready) {
				throw new Error(`The XPath ${xpathSelector} can not be resolved synchronously.`);
			}
			if (!allValues.value.length) {
				return '';
			}
			// Atomize to convert (attribute)nodes to be strings
			return allValues.value.map(value => castToType(atomize(value, dynamicContext), 'xs:string').value).join(' ');
		}
		case evaluateXPath.STRINGS_TYPE: {
			const allValues = rawResults.tryGetAllValues();
			if (!allValues.ready) {
				throw new Error(`The XPath ${xpathSelector} can not be resolved synchronously.`);
			}
			if (!allValues.value.length) {
				return [];
			}
			// Atomize all parts
			return allValues.value.map(function (value) {
				return atomize(value, dynamicContext).value + '';
			});
		}

		case evaluateXPath.NUMBER_TYPE: {
			const first = rawResults.tryGetFirst();
			if (!first.ready) {
				throw new Error(`The XPath ${xpathSelector} can not be resolved synchronously.`);
			}
			if (!first.value) {
				return NaN;
			}
			if (!isSubtypeOf(first.value.type, 'xs:numeric')) {
				return NaN;
			}
			return first.value.value;
		}

		case evaluateXPath.FIRST_NODE_TYPE: {
			const first = rawResults.tryGetFirst();
			if (!first.ready) {
				throw new Error(`The XPath ${xpathSelector} can not be resolved synchronously.`);
			}
			if (!first.value) {
				return null;
			}
			if (!(isSubtypeOf(first.value.type, 'node()'))) {
				throw new Error('Expected XPath ' + xpathSelector + ' to resolve to Node. Got ' + rawResults.value[0]);
			}
			if (isSubtypeOf(first.value.type, 'attribute()')) {
				throw new Error('XPath can not resolve to attribute nodes');
			}
			return first.value.value;
		}

		case evaluateXPath.NODES_TYPE: {
			const allResults = rawResults.tryGetAllValues();
			if (!allResults.ready) {
				throw new Error(`The XPath ${xpathSelector} can not be resolved synchronously.`);
			}

			if (!allResults.value.every(function (value) {
				return isSubtypeOf(value.type, 'node()');
			})) {
				throw new Error('Expected XPath ' + xpathSelector + ' to resolve to a sequence of Nodes.');
			}
			if (allResults.value.some(function (value) {
				return isSubtypeOf(value.type, 'attribute()');
			})) {
				throw new Error('XPath ' + xpathSelector + ' should not resolve to attribute nodes');
			}
			return allResults.value.map(function (nodeValue) {
				return nodeValue.value;
			});
		}

		case evaluateXPath.MAP_TYPE: {
			const allValues = rawResults.tryGetAllValues();
			if (!allValues.ready) {
				throw new Error(`The XPath ${xpathSelector} can not be resolved synchronously.`);
			}

			if (allValues.value.length !== 1) {
				throw new Error('Expected XPath ' + xpathSelector + ' to resolve to a single map.');
			}
			const first = allValues.value[0];
			if (!(isSubtypeOf(first.type, 'map(*)'))) {
				throw new Error('Expected XPath ' + xpathSelector + ' to resolve to a map');
			}
			const transformedMap = transformMapToObject(first, dynamicContext).next();
			if (!transformedMap.ready) {
				throw new Error('Expected XPath ' + xpathSelector + ' to synchronously resolve to a map');
			}
			return transformedMap.value;
		}

		case evaluateXPath.ARRAY_TYPE: {
			const allValues = rawResults.tryGetAllValues();
			if (!allValues.ready) {
				throw new Error(`The XPath ${xpathSelector} can not be resolved synchronously.`);
			}

			if (allValues.value.length !== 1) {
				throw new Error('Expected XPath ' + xpathSelector + ' to resolve to a single array.');
			}
			const first = allValues.value[0];
			if (!(isSubtypeOf(first.type, 'array(*)'))) {
				throw new Error('Expected XPath ' + xpathSelector + ' to resolve to an array');
			}
			const transformedArray = transformArrayToArray(first, dynamicContext).next();
			if (!transformedArray.ready) {
				throw new Error('Expected XPath ' + xpathSelector + ' to synchronously resolve to a map');
			}
			return transformedArray.value;
		}

		case evaluateXPath.NUMBERS_TYPE: {
			const allValues = rawResults.tryGetAllValues();
			if (!allValues.ready) {
				throw new Error(`The XPath ${xpathSelector} can not be resolved synchronously.`);
			}
			return allValues.value.map(function (value) {
				if (!isSubtypeOf(value.type, 'xs:numeric')) {
					throw new Error('Expected XPath ' + xpathSelector + ' to resolve to numbers');
				}
				return value.value;
			});
		}

		case evaluateXPath.ASYNC_ITERATOR_TYPE: {
			/**
			 * @type {./selectors/util/iterators.AsyncIterator}
			 */
			const it = rawResults.value();
			let transformedValueGenerator = null;
			let done = false;
			function getNextResult () {
				while (!done) {
					if (!transformedValueGenerator) {
						const value = it.next();
						if (value.done) {
							done = true;
							break;
						}
						if (!value.ready) {
							return value.promise.then(getNextResult);
						}
						transformedValueGenerator = transformXPathItemToJavascriptObject(value.value, dynamicContext);
					}
					const transformedValue = transformedValueGenerator.next();
					if (!transformedValue.ready) {
						return transformedValue.promise.then(getNextResult);
					}
					transformedValueGenerator = null;
					return transformedValue;
				}
				return {
					done: true
				};
			}
			if ('asyncIterator' in Symbol) {
				return {
					[(/** @type {{asyncIterator:*}} */ (Symbol)).asyncIterator]: function () {
						return this;
					},
					next: () => new Promise(resolve => resolve(getNextResult()))
				};
			}
			return {
				next: () => new Promise(resolve => resolve(getNextResult()))
			};
		}

		default: {
			const allValues = rawResults.tryGetAllValues();
			if (!allValues.ready) {
				throw new Error('The XPath ' + xpathSelector + ' can not be resolved synchronously.');
			}
			const allValuesAreNodes = allValues.value.every(function (value) {
				return isSubtypeOf(value.type, 'node()') &&
					!(isSubtypeOf(value.type, 'attribute()'));
				});
			if (allValuesAreNodes) {
				if (allValues.value.length === 1) {
					return allValues.value[0].value;
				}
				return allValues.value.map(function (nodeValue) {
					return nodeValue.value;
				});
			}
			if (allValues.value.length === 1) {
				return atomize(allValues.value[0], dynamicContext).value;
			}
			return rawResults.atomize(dynamicContext).getAllValues().map(function (atomizedValue) {
				return atomizedValue.value;
			});
		}
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

evaluateXPath['ASYNC_ITERATOR_TYPE'] = evaluateXPath.ASYNC_ITERATOR_TYPE = 99;

/**
 * Resolve to an array of numbers
 */
evaluateXPath['NUMBERS_TYPE'] = evaluateXPath.NUMBERS_TYPE = 13;

export default evaluateXPath;
