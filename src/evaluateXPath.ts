import ExternalDomFacade from './domFacade/ExternalDomFacade';
import IDomFacade from './domFacade/IDomFacade';
import buildContext from './evaluationUtils/buildContext';
import { printAndRethrowError } from './evaluationUtils/printAndRethrowError';
import atomize from './expressions/dataTypes/atomize';
import castToType from './expressions/dataTypes/castToType';
import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import sequenceFactory from './expressions/dataTypes/sequenceFactory';
import DynamicContext from './expressions/DynamicContext';
import ExecutionParameters from './expressions/ExecutionParameters';
import Expression from './expressions/Expression';
import { DONE_TOKEN, IterationHint, notReady, ready } from './expressions/util/iterators';
import getBucketsForNode from './getBucketsForNode';
import INodesFactory from './nodesFactory/INodesFactory';
import { Node } from './types/Types';

function transformMapToObject(map, dynamicContext) {
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
					const val = map.keyValuePairs[i]
						.value()
						.switchCases({
							default: seq => seq,
							multiple: () => {
								throw new Error(
									'Serialization error: The value of an entry in a map is expected to be a singleton sequence.'
								);
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

					transformedValueIterator = transformXPathItemToJavascriptObject(
						val.value,
						dynamicContext
					);
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

function transformArrayToArray(array, dynamicContext) {
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
					const val = array.members[i]()
						.switchCases({
							default: seq => seq,
							multiple: () => {
								throw new Error(
									'Serialization error: The value of an entry in an array is expected to be a singleton sequence.'
								);
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
					transformedMemberGenerator = transformXPathItemToJavascriptObject(
						val.value,
						dynamicContext
					);
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

function transformXPathItemToJavascriptObject(value, dynamicContext) {
	if (isSubtypeOf(value.type, 'map(*)')) {
		return transformMapToObject(value, dynamicContext);
	}
	if (isSubtypeOf(value.type, 'array(*)')) {
		return transformArrayToArray(value, dynamicContext);
	}
	if (isSubtypeOf(value.type, 'xs:QName')) {
		return {
			next: () => ready(`Q{${value.value.namespaceURI || ''}}${value.value.localName}`)
		};
	}
	return {
		next: () => ready(value.value)
	};
}

/**
 * @public
 */
export type Options = {
	debug?: boolean;
	language?: Language;
	moduleImports?: { [s: string]: string };
	namespaceResolver?: (s: string) => string | null;
	nodesFactory?: INodesFactory;
};

/**
 * @public
 */
export enum ReturnType {
	ANY = 0,
	NUMBER = 1,
	STRING = 2,
	BOOLEAN = 3,
	NODES = 7,
	FIRST_NODE = 9,
	STRINGS = 10,
	MAP = 11,
	ARRAY = 12,
	NUMBERS = 13,
	ASYNC_ITERATOR = 99
}

/**
 * @public
 */
export interface IReturnTypes<T extends Node> {
	[ReturnType.ANY]: any;
	[ReturnType.NUMBER]: number;
	[ReturnType.STRING]: string;
	[ReturnType.BOOLEAN]: boolean;
	[ReturnType.NODES]: T[];
	[ReturnType.FIRST_NODE]: T|null;
	[ReturnType.STRINGS]: string[];
	[ReturnType.MAP]: { [s: string]: any };
	[ReturnType.ARRAY]: any[];
	[ReturnType.NUMBERS]: number[];
	[ReturnType.ASYNC_ITERATOR]: AsyncIterator<any>;
}

/**
 * Evaluates an XPath on the given contextItem.
 *
 * If the return type is ANY_TYPE, the returned value depends on the result of the XPath:
 *  * If the XPath evaluates to the empty sequence, an empty array is returned.
 *  * If the XPath evaluates to a singleton node, that node is returned.
 *  * If the XPath evaluates to a singleton value, that value is atomized and returned.
 *  * If the XPath evaluates to a sequence of nodes, those nodes are returned.
 *  * Else, the sequence is atomized and returned.
 *
 * @public
 *
 * @param  selector    - The selector to execute. Supports XPath 3.1.
 * @param  contextItem - The node from which to run the XPath.
 * @param  domFacade   - The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables   - Extra variables (name to value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param  returnType  - One of the return types, indicates the expected type of the XPath query.
 * @param  options     - Extra options for evaluating this XPath
 *
 * @returns The result of executing this XPath
 */
function evaluateXPath<TNode extends Node, TReturnType extends keyof IReturnTypes<TNode>> (
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	returnType?: TReturnType,
	options?: Options | null
): IReturnTypes<TNode>[TReturnType] {
	returnType = returnType || (ReturnType.ANY as any);
	if (!selector || typeof selector !== 'string') {
		throw new TypeError("Failed to execute 'evaluateXPath': xpathExpression must be a string.");
	}

	options = options || {};

	let dynamicContext: DynamicContext;
	let executionParameters: ExecutionParameters;
	let expression: Expression;
	try {
		const context = buildContext(
			selector,
			contextItem,
			domFacade || null,
			variables || {},
			options,
			{
				allowUpdating: false,
				allowXQuery: options['language'] === Language.XQUERY_3_1_LANGUAGE,
				debug: !!options['debug']
			}
		);
		dynamicContext = context.dynamicContext;
		executionParameters = context.executionParameters;
		expression = context.expression;
	} catch (error) {
		printAndRethrowError(selector, error);
	}

	// Shortcut: if the xpathExpression defines buckets, the
	// contextItem is a node and we are evaluating to a bucket, we can
	// use it to return false if we are sure it won't match.
	if (returnType === ReturnType.BOOLEAN && contextItem && 'nodeType' in contextItem) {
		const selectorBucket = expression.getBucket();
		const bucketsForNode = getBucketsForNode(contextItem);
		if (selectorBucket !== null && !bucketsForNode.includes(selectorBucket)) {
			// We are sure that this selector will never match, without even running it
			return false;
		}
	}

	try {
		const rawResults = expression.evaluateMaybeStatically(dynamicContext, executionParameters);

		switch (returnType) {
			case ReturnType.BOOLEAN: {
				const ebv = rawResults.tryGetEffectiveBooleanValue();
				if (!ebv.ready) {
					throw new Error(`The XPath ${selector} can not be resolved synchronously.`);
				}
				return ebv.value;
			}

			case ReturnType.STRING: {
				const allValues = rawResults.tryGetAllValues();
				if (!allValues.ready) {
					throw new Error(`The XPath ${selector} can not be resolved synchronously.`);
				}
				if (!allValues.value.length) {
					return '';
				}
				// Atomize to convert (attribute)nodes to be strings
				return allValues.value
					.map(
						value => castToType(atomize(value, executionParameters), 'xs:string').value
					)
					.join(' ');
			}
			case ReturnType.STRINGS: {
				const allValues = rawResults.tryGetAllValues();
				if (!allValues.ready) {
					throw new Error(`The XPath ${selector} can not be resolved synchronously.`);
				}
				if (!allValues.value.length) {
					return [];
				}
				// Atomize all parts
				return allValues.value.map(value => {
					return atomize(value, executionParameters).value + '';
				});
			}

			case ReturnType.NUMBER: {
				const first = rawResults.tryGetFirst();
				if (!first.ready) {
					throw new Error(`The XPath ${selector} can not be resolved synchronously.`);
				}
				if (!first.value) {
					return NaN;
				}
				if (!isSubtypeOf(first.value.type, 'xs:numeric')) {
					return NaN;
				}
				return first.value.value;
			}

			case ReturnType.FIRST_NODE: {
				const first = rawResults.tryGetFirst();
				if (!first.ready) {
					throw new Error(`The XPath ${selector} can not be resolved synchronously.`);
				}
				if (!first.value) {
					return null;
				}
				if (!isSubtypeOf(first.value.type, 'node()')) {
					throw new Error(
						'Expected XPath ' +
							selector +
							' to resolve to Node. Got ' +
							first.value.type
					);
				}
				return first.value.value;
			}

			case ReturnType.NODES: {
				const allResults = rawResults.tryGetAllValues();
				if (!allResults.ready) {
					throw new Error(`The XPath ${selector} can not be resolved synchronously.`);
				}

				if (
					!allResults.value.every(value => {
						return isSubtypeOf(value.type, 'node()');
					})
				) {
					throw new Error(
						'Expected XPath ' + selector + ' to resolve to a sequence of Nodes.'
					);
				}
				return allResults.value.map(nodeValue => {
					return nodeValue.value;
				});
			}

			case ReturnType.MAP: {
				const allValues = rawResults.tryGetAllValues();
				if (!allValues.ready) {
					throw new Error(`The XPath ${selector} can not be resolved synchronously.`);
				}

				if (allValues.value.length !== 1) {
					throw new Error('Expected XPath ' + selector + ' to resolve to a single map.');
				}
				const first = allValues.value[0];
				if (!isSubtypeOf(first.type, 'map(*)')) {
					throw new Error('Expected XPath ' + selector + ' to resolve to a map');
				}
				const transformedMap = transformMapToObject(first, dynamicContext).next();
				if (!transformedMap.ready) {
					throw new Error(
						'Expected XPath ' + selector + ' to synchronously resolve to a map'
					);
				}
				return transformedMap.value;
			}

			case ReturnType.ARRAY: {
				const allValues = rawResults.tryGetAllValues();
				if (!allValues.ready) {
					throw new Error(`The XPath ${selector} can not be resolved synchronously.`);
				}

				if (allValues.value.length !== 1) {
					throw new Error(
						'Expected XPath ' + selector + ' to resolve to a single array.'
					);
				}
				const first = allValues.value[0];
				if (!isSubtypeOf(first.type, 'array(*)')) {
					throw new Error('Expected XPath ' + selector + ' to resolve to an array');
				}
				const transformedArray = transformArrayToArray(first, dynamicContext).next();
				if (!transformedArray.ready) {
					throw new Error(
						'Expected XPath ' + selector + ' to synchronously resolve to a map'
					);
				}
				return transformedArray.value;
			}

			case ReturnType.NUMBERS: {
				const allValues = rawResults.tryGetAllValues();
				if (!allValues.ready) {
					throw new Error(`The XPath ${selector} can not be resolved synchronously.`);
				}
				return allValues.value.map(value => {
					if (!isSubtypeOf(value.type, 'xs:numeric')) {
						throw new Error('Expected XPath ' + selector + ' to resolve to numbers');
					}
					return value.value;
				});
			}

			case ReturnType.ASYNC_ITERATOR: {
				const it = rawResults.value;
				let transformedValueGenerator = null;
				let done = false;
				const getNextResult = () => {
					while (!done) {
						if (!transformedValueGenerator) {
							const value = it.next(IterationHint.NONE);
							if (value.done) {
								done = true;
								break;
							}
							if (!value.ready) {
								return value.promise.then(getNextResult);
							}
							transformedValueGenerator = transformXPathItemToJavascriptObject(
								value.value,
								dynamicContext
							);
						}
						const transformedValue = transformedValueGenerator.next();
						if (!transformedValue.ready) {
							return transformedValue.promise.then(getNextResult);
						}
						transformedValueGenerator = null;
						return transformedValue;
					}
					return Promise.resolve({
						done: true,
						value: null
					});
				};
				if ('asyncIterator' in Symbol) {
					return {
						[Symbol.asyncIterator]() {
							return this;
						},
						next: () =>
							new Promise(resolve => resolve(getNextResult())).catch(error => {
								printAndRethrowError(selector, error);
							})
					};
				}
				return {
					next: () => new Promise(resolve => resolve(getNextResult()))
				};
			}

			default: {
				const allValues = rawResults.tryGetAllValues();
				if (!allValues.ready) {
					throw new Error(
						'The XPath ' + selector + ' can not be resolved synchronously.'
					);
				}
				const allValuesAreNodes = allValues.value.every(value => {
					return (
						isSubtypeOf(value.type, 'node()') && !isSubtypeOf(value.type, 'attribute()')
					);
				});
				if (allValuesAreNodes) {
					if (allValues.value.length === 1) {
						return allValues.value[0].value;
					}
					return allValues.value.map(nodeValue => {
						return nodeValue.value;
					});
				}
				if (allValues.value.length === 1) {
					const first = allValues.value[0];
					if (isSubtypeOf(first.type, 'array(*)')) {
						const transformedArray = transformArrayToArray(
							first,
							dynamicContext
						).next();
						if (!transformedArray.ready) {
							throw new Error(
								'Expected XPath ' +
									selector +
									' to synchronously resolve to an array'
							);
						}
						return transformedArray.value;
					}
					if (isSubtypeOf(first.type, 'map(*)')) {
						const transformedMap = transformMapToObject(first, dynamicContext).next();
						if (!transformedMap.ready) {
							throw new Error(
								'Expected XPath ' + selector + ' to synchronously resolve to a map'
							);
						}
						return transformedMap.value;
					}
					return atomize(allValues.value[0], executionParameters).value;
				}

				return sequenceFactory
					.create(allValues.value)
					.atomize(executionParameters)
					.getAllValues()
					.map(atomizedValue => {
						return atomizedValue.value;
					});
			}
		}
	} catch (error) {
		printAndRethrowError(selector, error);
	}
};

/**
 * Returns the result of the query, can be anything depending on the
 * query. Note that the return type is determined dynamically, not
 * statically: XPaths returning empty sequences will return empty
 * arrays and not null, like one might expect.
 */
evaluateXPath['ANY_TYPE'] = evaluateXPath.ANY_TYPE = ReturnType.ANY as ReturnType.ANY;

/**
 * Resolve to a number, like count((1,2,3)) resolves to 3.
 */
evaluateXPath['NUMBER_TYPE'] = evaluateXPath.NUMBER_TYPE = ReturnType.NUMBER as ReturnType.NUMBER;

/**
 * Resolve to a string, like //someElement[1] resolves to the text
 * content of the first someElement
 */
evaluateXPath['STRING_TYPE'] = evaluateXPath.STRING_TYPE = ReturnType.STRING as ReturnType.STRING;

/**
 * Resolves to true or false, uses the effective boolean value to
 * determine the result. count(1) resolves to true, count(())
 * resolves to false
 */
evaluateXPath['BOOLEAN_TYPE'] = evaluateXPath.BOOLEAN_TYPE = ReturnType.BOOLEAN as ReturnType.BOOLEAN;

/**
 * Resolve to all nodes the XPath resolves to. Returns nodes in the
 * order the XPath would. Meaning (//a, //b) resolves to all A nodes,
 * followed by all B nodes. //*[self::a or self::b] resolves to A and
 * B nodes in document order.
 */
evaluateXPath['NODES_TYPE'] = evaluateXPath.NODES_TYPE = ReturnType.NODES as ReturnType.NODES;

/**
 * Resolves to the first node.NODES_TYPE would have resolved to.
 */
evaluateXPath['FIRST_NODE_TYPE'] = evaluateXPath.FIRST_NODE_TYPE = ReturnType.FIRST_NODE as ReturnType.FIRST_NODE;

/**
 * Resolve to an array of strings
 */
evaluateXPath['STRINGS_TYPE'] = evaluateXPath.STRINGS_TYPE = ReturnType.STRINGS as ReturnType.STRINGS;

/**
 * Resolve to an object, as a map
 */
evaluateXPath['MAP_TYPE'] = evaluateXPath.MAP_TYPE = ReturnType.MAP as ReturnType.MAP;

evaluateXPath['ARRAY_TYPE'] = evaluateXPath.ARRAY_TYPE = ReturnType.ARRAY as ReturnType.ARRAY;

evaluateXPath['ASYNC_ITERATOR_TYPE'] = evaluateXPath.ASYNC_ITERATOR_TYPE =
	ReturnType.ASYNC_ITERATOR as ReturnType.ASYNC_ITERATOR;

/**
 * Resolve to an array of numbers
 */
evaluateXPath['NUMBERS_TYPE'] = evaluateXPath.NUMBERS_TYPE = ReturnType.NUMBERS as ReturnType.NUMBERS;

/**
 * @public
 */
export enum Language {
	XPATH_3_1_LANGUAGE = 'XPath3.1',
	XQUERY_3_1_LANGUAGE = 'XQuery3.1'
}

/**
 * Can be used to signal an XQuery program should be executed instead
 * of an XPath
 */
evaluateXPath['XQUERY_3_1_LANGUAGE'] = evaluateXPath.XQUERY_3_1_LANGUAGE =
	Language.XQUERY_3_1_LANGUAGE;

/**
 * Can be used to signal an XPath program should executed
 */
evaluateXPath['XPATH_3_1_LANGUAGE'] = evaluateXPath.XPATH_3_1_LANGUAGE =
	Language.XPATH_3_1_LANGUAGE;

export default evaluateXPath;
