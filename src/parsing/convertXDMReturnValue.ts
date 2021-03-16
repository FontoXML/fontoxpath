import realizeDom from '../domClone/realizeDom';
import { printAndRethrowError } from '../evaluationUtils/printAndRethrowError';
import ArrayValue from '../expressions/dataTypes/ArrayValue';
import atomize, { atomizeSingleValue } from '../expressions/dataTypes/atomize';
import castToType from '../expressions/dataTypes/castToType';
import ISequence from '../expressions/dataTypes/ISequence';
import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import MapValue from '../expressions/dataTypes/MapValue';
import sequenceFactory from '../expressions/dataTypes/sequenceFactory';
import ExecutionParameters from '../expressions/ExecutionParameters';
import { IterationHint } from '../expressions/util/iterators';
import transformXPathItemToJavascriptObject, {
	transformArrayToArray,
	transformMapToObject,
} from '../transformXPathItemToJavascriptObject';
import { Node } from '../types/Types';
import { NodePointer } from 'src/domClone/Pointer';

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
	ASYNC_ITERATOR = 99,
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
	[ReturnType.ASYNC_ITERATOR]: AsyncIterableIterator<any>;
}

export default function convertXDMReturnValue<
	TNode extends Node,
	TReturnType extends keyof IReturnTypes<TNode>
>(
	expression: string,
	rawResults: ISequence,
	returnType: TReturnType,
	executionParameters: ExecutionParameters
): IReturnTypes<TNode>[TReturnType] {
	switch (returnType) {
		case ReturnType.BOOLEAN: {
			const ebv = rawResults.getEffectiveBooleanValue();
			return ebv as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.STRING: {
			const allValues = atomize(rawResults, executionParameters).tryGetAllValues();
			if (!allValues.value.length) {
				return '' as IReturnTypes<TNode>[TReturnType];
			}
			// Atomize to convert (attribute)nodes to be strings
			return allValues.value
				.map((value) => castToType(value, 'xs:string').value)
				.join(' ') as IReturnTypes<TNode>[TReturnType];
		}
		case ReturnType.STRINGS: {
			const allValues = atomize(rawResults, executionParameters).tryGetAllValues();
			if (!allValues.value.length) {
				return [] as IReturnTypes<TNode>[TReturnType];
			}
			// Atomize all parts
			return allValues.value.map((value) => {
				return value.value + '';
			}) as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.NUMBER: {
			const first = rawResults.first();
			if (first === null) {
				return NaN as IReturnTypes<TNode>[TReturnType];
			}
			if (!isSubtypeOf(first.type, 'xs:numeric')) {
				return NaN as IReturnTypes<TNode>[TReturnType];
			}
			return first.value as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.FIRST_NODE: {
			const first = rawResults.first();
			if (first === null) {
				return null as IReturnTypes<TNode>[TReturnType];
			}
			if (!isSubtypeOf(first.type, 'node()')) {
				throw new Error(
					'Expected XPath ' + expression + ' to resolve to Node. Got ' + first.type
				);
			}
			// over here: unravel pointers. if they point to actual nodes:return them. if they point
			// to lightweights, really make them, if they point to clones, clone them etc

			return realizeDom(
				first.value as NodePointer,
				executionParameters,
				false
			) as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.NODES: {
			const allResults = rawResults.tryGetAllValues();

			if (
				!allResults.value.every((value) => {
					return isSubtypeOf(value.type, 'node()');
				})
			) {
				throw new Error(
					'Expected XPath ' + expression + ' to resolve to a sequence of Nodes.'
				);
			}
			return allResults.value.map((nodeValue) => {
				return realizeDom(
					nodeValue.value as NodePointer,
					executionParameters,
					false
				) as unknown;
			}) as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.MAP: {
			const allValues = rawResults.tryGetAllValues();

			if (allValues.value.length !== 1) {
				throw new Error('Expected XPath ' + expression + ' to resolve to a single map.');
			}
			const first = allValues.value[0];
			if (!isSubtypeOf(first.type, 'map(*)')) {
				throw new Error('Expected XPath ' + expression + ' to resolve to a map');
			}
			const transformedMap = transformMapToObject(
				first as MapValue,
				executionParameters
			).next(IterationHint.NONE);
			return transformedMap.value as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.ARRAY: {
			const allValues = rawResults.getAllValues();

			if (allValues.length !== 1) {
				throw new Error('Expected XPath ' + expression + ' to resolve to a single array.');
			}
			const first = allValues[0];
			if (!isSubtypeOf(first.type, 'array(*)')) {
				throw new Error('Expected XPath ' + expression + ' to resolve to an array');
			}
			const transformedArray = transformArrayToArray(
				first as ArrayValue,
				executionParameters
			).next(IterationHint.NONE);
			return transformedArray.value as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.NUMBERS: {
			const allValues = rawResults.tryGetAllValues();
			return allValues.value.map((value) => {
				if (!isSubtypeOf(value.type, 'xs:numeric')) {
					throw new Error('Expected XPath ' + expression + ' to resolve to numbers');
				}
				return value.value;
			}) as IReturnTypes<TNode>[TReturnType];
		}

		case ReturnType.ASYNC_ITERATOR: {
			const it = rawResults.value;
			let transformedValueGenerator = null;
			let done = false;
			const getNextResult: () => Promise<IteratorResult<any>> = () => {
				while (!done) {
					if (!transformedValueGenerator) {
						const value = it.next(IterationHint.NONE);
						if (value.done) {
							done = true;
							break;
						}
						transformedValueGenerator = transformXPathItemToJavascriptObject(
							value.value,
							executionParameters
						);
					}
					const transformedValue = transformedValueGenerator.next();
					transformedValueGenerator = null;
					return transformedValue;
				}
				return Promise.resolve({
					done: true,
					value: null,
				});
			};
			let toReturn: AsyncIterableIterator<any>;
			if ('asyncIterator' in Symbol) {
				toReturn = {
					[Symbol.asyncIterator]() {
						return this;
					},
					next: () =>
						new Promise<IteratorResult<any>>((resolve) =>
							resolve(getNextResult())
						).catch((error) => {
							printAndRethrowError(expression, error);
						}),
				};
			} else {
				toReturn = ({
					next: () => new Promise((resolve) => resolve(getNextResult())),
				} as unknown) as AsyncIterableIterator<any>;
			}
			return toReturn as IReturnTypes<TNode>[TReturnType];
		}

		default: {
			const allValues = rawResults.getAllValues();
			const allValuesAreNodes = allValues.every((value) => {
				return isSubtypeOf(value.type, 'node()') && !isSubtypeOf(value.type, 'attribute()');
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
				if (isSubtypeOf(first.type, 'array(*)')) {
					const transformedArray = transformArrayToArray(
						first as ArrayValue,
						executionParameters
					).next(IterationHint.NONE);
					return transformedArray.value as IReturnTypes<TNode>[TReturnType];
				}
				if (isSubtypeOf(first.type, 'map(*)')) {
					const transformedMap = transformMapToObject(
						first as MapValue,
						executionParameters
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
