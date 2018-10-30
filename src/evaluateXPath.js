import parseExpression from './parsing/parseExpression';
import adaptJavaScriptValueToXPathValue from './expressions/adaptJavaScriptValueToXPathValue';
import DynamicContext from './expressions/DynamicContext';
import DomFacade from './DomFacade';
import ExecutionParameters from './expressions/ExecutionParameters';
import domBackedDomFacade from './domBackedDomFacade';

import atomize from './expressions/dataTypes/atomize';
import castToType from './expressions/dataTypes/castToType';
import Sequence from './expressions/dataTypes/Sequence';
import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import staticallyCompileXPath from './parsing/staticallyCompileXPath';

import { generateGlobalVariableBindingName } from './expressions/ExecutionSpecificStaticContext';

import { DONE_TOKEN, ready, notReady } from './expressions/util/iterators';

function normalizeEndOfLines (xpathString) {
	// Replace all character sequences of 0xD followed by 0xA and all 0xD not followed by 0xA with 0xA.
	return xpathString.replace(/(\x0D\x0A)|(\x0D(?!\x0A))/g, String.fromCharCode(0xA));
}

function transformMapToObject (map, dynamicContext) {
	const mapObj = {};
	let i = 0;
	let done = false;
	let transformedValueIterator = null;
	return {
		next: () => {
			if (done) {
				return DONE_TOKEN;
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
						return notReady(val.promise);
					}
					if (val.value === null) {
						mapObj[map.keyValuePairs[i].key.value] = null;
						i++;
						continue;
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
			return ready(mapObj);
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
				return DONE_TOKEN;
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
						return notReady(val.promise);
					}
					if (val.value === null) {
						arr[i++] = null;
						continue;
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
			return ready(arr);
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
	if (isSubtypeOf(value.type, 'xs:QName')) {
		return { next: () => ready(`Q{${value.value.namespaceURI || ''}}${value.value.localPart}`) };
	}
	return {
		next: () => ready(value.value)
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
 * @typedef {{
 *   namespaceResolver: (undefined|?function(string):string?),
 *   nodesFactory: (undefined|INodesFactory?),
 *   language: (undefined|string),
 *   moduleImports: (undefined|Object<string, string>)
 * }}
 */
let Options;

/**
 * Evaluates an XPath on the given contextItem.
 * If the return type is ANY_TYPE, the returned value depends on the result of the XPath:
 *  * If the XPath evaluates to the empty sequence, an empty array is returned.
 *  * If the XPath evaluates to a singleton node, that node is returned.
 *  * If the XPath evaluates to a singleton value, that value is atomized and returned.
 *  * If the XPath evaluates to a sequence of nodes, those nodes are returned.
 *  * Else, the sequence is atomized and returned.
 *
 * @param  {!string}       xpathExpression  The selector to execute. Supports XPath 3.1.
 * @param  {Node|*|null}   contextItem    The node from which to run the XPath.
 * @param  {?IDomFacade=}  domFacade      The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}      variables      Extra variables (name=>value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param  {?number=}      returnType     One of the return types, indicates the expected type of the XPath query.
 * @param  {?Options=}     options        Extra options for evaluating this XPath
 *
 * @return  {!Array<!Node>|Node|!Array<*>|*}
 */
function evaluateXPath (xpathExpression, contextItem, domFacade, variables, returnType = evaluateXPath.ANY_TYPE, options = { namespaceResolver: null, nodesFactory: null, language: 'XPath3.1', moduleImports: {} }) {
	if (!variables) {
		variables = {};
	}
	variables = Object.assign(
		{ 'theBest': 'FontoXML is the best!' },
		variables);
	if (!xpathExpression || typeof xpathExpression !== 'string' ) {
		throw new TypeError('Failed to execute \'evaluateXPath\': xpathExpression must be a string.');
	}
	if (!domFacade) {
		domFacade = domBackedDomFacade;
	}

	xpathExpression = normalizeEndOfLines(xpathExpression);

	// Always wrap in an actual domFacade
	const wrappedDomFacade = new DomFacade(domFacade);

	const compilationOptions = {
		allowXQuery: options.language === 'XQuery3.1',
		disableCache: options.disableCache
	};

	const moduleImports = options['moduleImports'] || Object.create(null);

	const namespaceResolver = options['namespaceResolver'] || createDefaultNamespaceResolver(contextItem);
	const compiledExpression = staticallyCompileXPath(
		xpathExpression,
		compilationOptions,
		namespaceResolver,
		variables,
		moduleImports);

	const contextSequence = contextItem ? adaptJavaScriptValueToXPathValue(contextItem) : Sequence.empty();

	/**
	 * @type {INodesFactory}
	 */
	let nodesFactory = options['nodesFactory'];
	if (!nodesFactory && compilationOptions.allowXQuery) {
		if (contextItem && 'nodeType' in /** @type {!Node} */(contextItem)) {
			const ownerDocument = /** @type {Document} }*/(contextItem.ownerDocument || contextItem);
			if ((typeof ownerDocument.createElementNS === 'function') &&
				(typeof ownerDocument.createProcessingInstruction === 'function') &&
				(typeof ownerDocument.createTextNode === 'function') &&
				(typeof ownerDocument.createComment === 'function')) {

				nodesFactory = /** @type {!INodesFactory} */({
					createElementNS: ownerDocument.createElementNS.bind(ownerDocument),
					createTextNode: ownerDocument.createTextNode.bind(ownerDocument),
					createComment: ownerDocument.createComment.bind(ownerDocument),
					createProcessingInstruction: ownerDocument.createProcessingInstruction.bind(ownerDocument),
					createAttributeNS: ownerDocument.createAttributeNS.bind(ownerDocument)
				});
			}
		}

		if (!nodesFactory) {
			// We do not have a nodesFactory instance as a parameter, nor can we generate one from the context item.
			// Throw an error as soon as one of these functions is called.
			nodesFactory = {
				createElementNS: () => {
					throw new Error('Please pass a node factory if an XQuery script uses node constructors');
				},
				createTextNode: () => {
					throw new Error('Please pass a node factory if an XQuery script uses node constructors');
				},
				createComment: () => {
					throw new Error('Please pass a node factory if an XQuery script uses node constructors');
				},
				createProcessingInstruction: () => {
					throw new Error('Please pass a node factory if an XQuery script uses node constructors');
				},
				createAttributeNS: () => {
					throw new Error('Please pass a node factory if an XQuery script uses node constructors');
				}
			};
		}
	}

	/**
	 * @type {!DynamicContext}
	 */
	const dynamicContext = new DynamicContext({
		contextItemIndex: 0,
		contextSequence: contextSequence,
		contextItem: contextSequence.first(),
		variableBindings: Object.keys(variables).reduce((typedVariableByName, variableName) => {
			typedVariableByName[generateGlobalVariableBindingName(variableName)] =
				() => adaptJavaScriptValueToXPathValue(variables[variableName]);
			return typedVariableByName;
		}, Object.create(null))
	});

	const executionParameters = new ExecutionParameters(wrappedDomFacade, nodesFactory);

	/**
	 * @type {!Sequence}
	 */
	const rawResults = compiledExpression.evaluateMaybeStatically(dynamicContext, {
		domFacade: wrappedDomFacade,
		nodesFactory: nodesFactory,
		parseExpression: parseExpression
	});

	switch (returnType) {
		case evaluateXPath.BOOLEAN_TYPE: {
			const ebv = rawResults.tryGetEffectiveBooleanValue();
			if (!ebv.ready) {
				throw new Error(`The XPath ${xpathExpression} can not be resolved synchronously.`);
			}
			return ebv.value;
		}

		case evaluateXPath.STRING_TYPE: {
			const allValues = rawResults.tryGetAllValues();
			if (!allValues.ready) {
				throw new Error(`The XPath ${xpathExpression} can not be resolved synchronously.`);
			}
			if (!allValues.value.length) {
				return '';
			}
			// Atomize to convert (attribute)nodes to be strings
			return allValues.value.map(value => castToType(atomize(value, executionParameters), 'xs:string').value).join(' ');
		}
		case evaluateXPath.STRINGS_TYPE: {
			const allValues = rawResults.tryGetAllValues();
			if (!allValues.ready) {
				throw new Error(`The XPath ${xpathExpression} can not be resolved synchronously.`);
			}
			if (!allValues.value.length) {
				return [];
			}
			// Atomize all parts
			return allValues.value.map(function (value) {
				return atomize(value, executionParameters).value + '';
			});
		}

		case evaluateXPath.NUMBER_TYPE: {
			const first = rawResults.tryGetFirst();
			if (!first.ready) {
				throw new Error(`The XPath ${xpathExpression} can not be resolved synchronously.`);
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
				throw new Error(`The XPath ${xpathExpression} can not be resolved synchronously.`);
			}
			if (!first.value) {
				return null;
			}
			if (!(isSubtypeOf(first.value.type, 'node()'))) {
				throw new Error('Expected XPath ' + xpathExpression + ' to resolve to Node. Got ' + rawResults.value[0]);
			}
			return first.value.value;
		}

		case evaluateXPath.NODES_TYPE: {
			const allResults = rawResults.tryGetAllValues();
			if (!allResults.ready) {
				throw new Error(`The XPath ${xpathExpression} can not be resolved synchronously.`);
			}

			if (!allResults.value.every(function (value) {
				return isSubtypeOf(value.type, 'node()');
			})) {
				throw new Error('Expected XPath ' + xpathExpression + ' to resolve to a sequence of Nodes.');
			}
			return allResults.value.map(function (nodeValue) {
				return nodeValue.value;
			});
		}

		case evaluateXPath.MAP_TYPE: {
			const allValues = rawResults.tryGetAllValues();
			if (!allValues.ready) {
				throw new Error(`The XPath ${xpathExpression} can not be resolved synchronously.`);
			}

			if (allValues.value.length !== 1) {
				throw new Error('Expected XPath ' + xpathExpression + ' to resolve to a single map.');
			}
			const first = allValues.value[0];
			if (!(isSubtypeOf(first.type, 'map(*)'))) {
				throw new Error('Expected XPath ' + xpathExpression + ' to resolve to a map');
			}
			const transformedMap = transformMapToObject(first, dynamicContext).next();
			if (!transformedMap.ready) {
				throw new Error('Expected XPath ' + xpathExpression + ' to synchronously resolve to a map');
			}
			return transformedMap.value;
		}

		case evaluateXPath.ARRAY_TYPE: {
			const allValues = rawResults.tryGetAllValues();
			if (!allValues.ready) {
				throw new Error(`The XPath ${xpathExpression} can not be resolved synchronously.`);
			}

			if (allValues.value.length !== 1) {
				throw new Error('Expected XPath ' + xpathExpression + ' to resolve to a single array.');
			}
			const first = allValues.value[0];
			if (!(isSubtypeOf(first.type, 'array(*)'))) {
				throw new Error('Expected XPath ' + xpathExpression + ' to resolve to an array');
			}
			const transformedArray = transformArrayToArray(first, dynamicContext).next();
			if (!transformedArray.ready) {
				throw new Error('Expected XPath ' + xpathExpression + ' to synchronously resolve to a map');
			}
			return transformedArray.value;
		}

		case evaluateXPath.NUMBERS_TYPE: {
			const allValues = rawResults.tryGetAllValues();
			if (!allValues.ready) {
				throw new Error(`The XPath ${xpathExpression} can not be resolved synchronously.`);
			}
			return allValues.value.map(function (value) {
				if (!isSubtypeOf(value.type, 'xs:numeric')) {
					throw new Error('Expected XPath ' + xpathExpression + ' to resolve to numbers');
				}
				return value.value;
			});
		}

		case evaluateXPath.ASYNC_ITERATOR_TYPE: {
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
				throw new Error('The XPath ' + xpathExpression + ' can not be resolved synchronously.');
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
				const first = allValues.value[0];
				if (isSubtypeOf(first.type, 'array(*)')) {
					const transformedArray = transformArrayToArray(first, dynamicContext).next();
					if (!transformedArray.ready) {
						throw new Error('Expected XPath ' + xpathExpression + ' to synchronously resolve to an array');
					}
					return transformedArray.value;
				}
				if (isSubtypeOf(first.type, 'map(*)')) {
					const transformedMap = transformMapToObject(first, dynamicContext).next();
					if (!transformedMap.ready) {
						throw new Error('Expected XPath ' + xpathExpression + ' to synchronously resolve to a map');
					}
					return transformedMap.value;
				}
				return atomize(allValues.value[0], executionParameters).value;
			}

			return new Sequence(allValues.value)
				.atomize(executionParameters)
				.getAllValues()
				.map(function (atomizedValue) {
					return atomizedValue.value;
			});
		}
	}
}

/**
 * Returns the result of the query, can be anything depending on the
 * query. Note that the return type is determined dynamically, not
 * statically: XPaths returning empty sequences will return empty
 * arrays and not null, like one might expect.
 */
evaluateXPath['ANY_TYPE'] = evaluateXPath.ANY_TYPE = 0;

/**
 * Resolve to a number, like count((1,2,3)) resolves to 3.
 */
evaluateXPath['NUMBER_TYPE'] = evaluateXPath.NUMBER_TYPE = 1;

/**
 * Resolve to a string, like //someElement[1] resolves to the text
 * content of the first someElement
 */
evaluateXPath['STRING_TYPE'] = evaluateXPath.STRING_TYPE = 2;

/**
 * Resolves to true or false, uses the effective boolean value to
 * determine the result. count(1) resolves to true, count(())
 * resolves to false
 */
evaluateXPath['BOOLEAN_TYPE'] = evaluateXPath.BOOLEAN_TYPE = 3;

/**
 * Resolve to all nodes the XPath resolves to. Returns nodes in the
 * order the XPath would. Meaning (//a, //b) resolves to all A nodes,
 * followed by all B nodes. //*[self::a or self::b] resolves to A and
 * B nodes in document order.
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

/**
 * Can be used to signal an XQuery program should be executed instead
 * of an XPath
 */
evaluateXPath['XQUERY_3_1_LANGUAGE'] = evaluateXPath.XQUERY_3_1_LANGUAGE = 'XQuery3.1';

/**
 * Can be used to signal an XPath program should executed
 */
evaluateXPath['XPATH_3_1_LANGUAGE'] = evaluateXPath.XPATH_3_1_LANGUAGE = 'XPath3.1';

export default evaluateXPath;
