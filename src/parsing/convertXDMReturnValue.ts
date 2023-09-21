import { NodePointer } from '../domClone/Pointer';
import realizeDom from '../domClone/realizeDom';
import { EvaluableExpression } from '../evaluateXPath';
import { printAndRethrowError } from '../evaluationUtils/printAndRethrowError';
import ArrayValue from '../expressions/dataTypes/ArrayValue';
import atomize, { atomizeSingleValue } from '../expressions/dataTypes/atomize';
import castToType from '../expressions/dataTypes/castToType';
import ISequence from '../expressions/dataTypes/ISequence';
import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import MapValue from '../expressions/dataTypes/MapValue';
import sequenceFactory from '../expressions/dataTypes/sequenceFactory';
import Value, { ValueType, valueTypeToString } from '../expressions/dataTypes/Value';
import ExecutionParameters from '../expressions/ExecutionParameters';
import { IIterator, IterationHint } from '../expressions/util/iterators';
import transformXPathItemToJavascriptObject, {
	transformArrayToArray,
	transformMapToObject,
} from '../transformXPathItemToJavascriptObject';
import { Node } from '../types/Types';
import evaluableExpressionToString from './evaluableExpressionToString';

/**
 * @public
 */
export enum ReturnType {
	/**
	 * ANY Will result in ANY result. This closesly resembles what XPathResult.ANY_TYPE returns.
	 *
	 * If the result is a single item (ie. one node, one string, one number, etcetera), only that value is returned.
	 *
	 * If the result is the empty sequence, an empty array is returned
	 *
	 * If the result is multiple items, an array with those items is returned. Nodes are returned as-is, but attribute nodes are atomized.
	 *
	 * Note that this is usually _not_ what you'd expect, and may cause bugs to show up when you
	 * don't expect. Use ALL_RESULTS to get all results, always as an array, without special
	 * handling for attribute nodes.
	 *
	 * @deprecated use ALL_RESULTS instead
	 */
	'ANY' = 0,

	/**
	 * Always returns a number. NaN if the result of the query is not a valid number
	 */
	'NUMBER' = 1,

	/**
	 * Always returns a string.
	 */
	'STRING' = 2,

	/**
	 * Always returns a boolean. Uses the `effective boolean value` algorithm to determine the result if the query did not return a boolean by itself
	 */
	'BOOLEAN' = 3,

	/**
	 * Returns all nodes, as an array. Throws an error if the result contains anything but nodes
	 */
	'NODES' = 7,

	/**
	 * Returns only the first node in the result
	 */
	'FIRST_NODE' = 9,

	/**
	 * Returns all strings the query returns, as an array
	 */
	'STRINGS' = 10,

	/**
	 * Returns the map the query returns. Error when the query does not result in exactly one map
	 */
	'MAP' = 11,

	/**
	 * Returns the array the query returns. Error when the query does not result in exactly one array
	 */
	'ARRAY' = 12,

	/**
	 * Returns all numbers the query resulted in. Invalid numbers are replaced with NaN
	 */
	'NUMBERS' = 13,

	/**
	 * Returns all results of the query, as completely as possible: nodes are nodes, attributes are attribute nodes, dateTimes are turned into DateTime objects.
	 */
	'ALL_RESULTS' = 14,

	/**
	 * Returns an async iterator of the results. Since FontoXPath can no longer return results asychronously, the ALL_RESULTS option is better to use.
	 *
	 * @deprecated Use ALL_RESULTS instead
	 */
	'ASYNC_ITERATOR' = 99,
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
	[ReturnType.FIRST_NODE]: T | null;
	[ReturnType.STRINGS]: string[];
	[ReturnType.MAP]: { [s: string]: any };
	[ReturnType.ARRAY]: any[];
	[ReturnType.NUMBERS]: number[];
	[ReturnType.ALL_RESULTS]: (
		| T
		| string
		| Date
		| boolean
		| number
		| any[]
		| { [s: string]: any }
	)[];
	[ReturnType.ASYNC_ITERATOR]: AsyncIterableIterator<any>;
}

export default function convertXDMReturnValue<
	TNode extends Node,
	TReturnType extends keyof IReturnTypes<TNode>,
>(
	expression: EvaluableExpression | string,
	rawResults: ISequence,
	returnType: TReturnType,
	executionParameters: ExecutionParameters,
): IReturnTypes<TNode>[TReturnType] {
	switch (returnType) {
		case ReturnType.BOOLEAN: {
			const ebv = rawResults.getEffectiveBooleanValue();
			return ebv as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.STRING: {
			const allValues = atomize(rawResults, executionParameters).getAllValues();
			if (!allValues.length) {
				return '' as IReturnTypes<TNode>[TReturnType];
			}
			// Atomize to convert (attribute)nodes to be strings
			return allValues
				.map((value) => castToType(value, ValueType.XSSTRING).value)
				.join(' ') as IReturnTypes<TNode>[TReturnType];
		}
		case ReturnType.STRINGS: {
			const allValues = atomize(rawResults, executionParameters).getAllValues();
			if (!allValues.length) {
				return [] as IReturnTypes<TNode>[TReturnType];
			}
			// Atomize all parts
			return allValues.map((value) => {
				return value.value + '';
			}) as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.NUMBER: {
			const first = rawResults.first();
			if (first === null) {
				return NaN as IReturnTypes<TNode>[TReturnType];
			}
			if (!isSubtypeOf(first.type, ValueType.XSNUMERIC)) {
				return NaN as IReturnTypes<TNode>[TReturnType];
			}
			return first.value as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.FIRST_NODE: {
			const first = rawResults.first();
			if (first === null) {
				return null as IReturnTypes<TNode>[TReturnType];
			}
			if (!isSubtypeOf(first.type, ValueType.NODE)) {
				throw new Error(
					'Expected XPath ' +
						evaluableExpressionToString(expression) +
						' to resolve to Node. Got ' +
						valueTypeToString(first.type),
				);
			}
			// over here: unravel pointers. if they point to actual nodes:return them. if they point
			// to lightweights, really make them, if they point to clones, clone them etc

			return realizeDom(
				first.value as NodePointer,
				executionParameters,
				false,
			) as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.NODES: {
			const allResults = rawResults.getAllValues();

			if (
				!allResults.every((value) => {
					return isSubtypeOf(value.type, ValueType.NODE);
				})
			) {
				throw new Error(
					'Expected XPath ' +
						evaluableExpressionToString(expression) +
						' to resolve to a sequence of Nodes.',
				);
			}
			return allResults.map((nodeValue) => {
				return realizeDom(
					nodeValue.value as NodePointer,
					executionParameters,
					false,
				) as unknown;
			}) as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.MAP: {
			const allValues = rawResults.getAllValues();

			if (allValues.length !== 1) {
				throw new Error(
					'Expected XPath ' +
						evaluableExpressionToString(expression) +
						' to resolve to a single map.',
				);
			}
			const first = allValues[0];
			if (!isSubtypeOf(first.type, ValueType.MAP)) {
				throw new Error(
					'Expected XPath ' +
						evaluableExpressionToString(expression) +
						' to resolve to a map',
				);
			}
			const transformedMap = transformMapToObject(
				first as MapValue,
				executionParameters,
			).next(IterationHint.NONE);
			return transformedMap.value as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.ARRAY: {
			const allValues = rawResults.getAllValues();

			if (allValues.length !== 1) {
				throw new Error(
					'Expected XPath ' +
						evaluableExpressionToString(expression) +
						' to resolve to a single array.',
				);
			}
			const first = allValues[0];
			if (!isSubtypeOf(first.type, ValueType.ARRAY)) {
				throw new Error(
					'Expected XPath ' +
						evaluableExpressionToString(expression) +
						' to resolve to an array',
				);
			}
			const transformedArray = transformArrayToArray(
				first as ArrayValue,
				executionParameters,
			).next(IterationHint.NONE);
			return transformedArray.value as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.NUMBERS: {
			const allValues = rawResults.getAllValues();
			return allValues.map((value) => {
				if (!isSubtypeOf(value.type, ValueType.XSNUMERIC)) {
					throw new Error(
						'Expected XPath ' +
							evaluableExpressionToString(expression) +
							' to resolve to numbers',
					);
				}
				return value.value;
			}) as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.ASYNC_ITERATOR: {
			const it = rawResults.value;
			let transformedValueGenerator: IIterator<Value> = null;
			let done = false;
			const getNextResult = () => {
				while (!done) {
					if (!transformedValueGenerator) {
						const value = it.next(IterationHint.NONE);
						if (value.done) {
							done = true;
							break;
						}
						transformedValueGenerator = transformXPathItemToJavascriptObject(
							value.value,
							executionParameters,
						);
					}
					const transformedValue = transformedValueGenerator.next(IterationHint.NONE);
					transformedValueGenerator = null;
					return transformedValue;
				}
				return Promise.resolve({
					done: true,
					value: null,
				});
			};
			const toReturn: AsyncIterableIterator<any> =
				'asyncIterator' in Symbol
					? {
							[Symbol.asyncIterator]() {
								return this;
							},
							next: () =>
								new Promise<IteratorResult<any>>((resolve) =>
									resolve(getNextResult()),
								).catch((error) => {
									printAndRethrowError(expression, error);
								}),
					  }
					: ({
							next: () => new Promise((resolve) => resolve(getNextResult())),
					  } as unknown as AsyncIterableIterator<any>);
			return toReturn as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.ALL_RESULTS: {
			const allValues = rawResults.getAllValues();

			return allValues.map((value) => {
				// TODO: Make this function directly return its value instead of an iterator to a
				// single value
				return transformXPathItemToJavascriptObject(value, executionParameters).next(
					IterationHint.NONE,
				).value;
			}) as IReturnTypes<TNode>[TReturnType];
		}

		default: {
			const allValues = rawResults.getAllValues();
			const allValuesAreNodes = allValues.every((value) => {
				return (
					isSubtypeOf(value.type, ValueType.NODE) &&
					!isSubtypeOf(value.type, ValueType.ATTRIBUTE)
				);
			});
			if (allValuesAreNodes) {
				const allResults = allValues.map((nodeValue) => {
					return realizeDom(nodeValue.value as NodePointer, executionParameters, false);
				}) as IReturnTypes<TNode>[TReturnType];

				if (allResults.length === 1) {
					return allResults[0];
				}
				return allResults;
			}
			if (allValues.length === 1) {
				const first = allValues[0];
				if (isSubtypeOf(first.type, ValueType.ARRAY)) {
					const transformedArray = transformArrayToArray(
						first as ArrayValue,
						executionParameters,
					).next(IterationHint.NONE);
					return transformedArray.value as IReturnTypes<TNode>[TReturnType];
				}
				if (isSubtypeOf(first.type, ValueType.MAP)) {
					const transformedMap = transformMapToObject(
						first as MapValue,
						executionParameters,
					).next(IterationHint.NONE);
					return transformedMap.value as IReturnTypes<TNode>[TReturnType];
				}
				return atomizeSingleValue(first, executionParameters).first()
					.value as IReturnTypes<TNode>[TReturnType];
			}

			return atomize(sequenceFactory.create(allValues), executionParameters)
				.getAllValues()
				.map((atomizedValue) => {
					return atomizedValue.value;
				}) as IReturnTypes<TNode>[TReturnType];
		}
	}
}
