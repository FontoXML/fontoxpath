import ArrayValue from '../dataTypes/ArrayValue';
import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import TypeDeclaration from '../dataTypes/TypeDeclaration';
import Value from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import { ARRAY_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import concatSequences from '../util/concatSequences';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import {
	DONE_TOKEN,
	IAsyncIterator,
	IAsyncResult,
	IterationHint,
	notReady,
	ready,
} from '../util/iterators';
import zipSingleton from '../util/zipSingleton';
import { errXPTY0004 } from '../XPathErrors';
import arrayGet from './builtInFunctions_arrays_get';
import sequenceDeepEqual, { itemDeepEqual } from './builtInFunctions_sequences_deepEqual';
import { transformArgumentList } from './FunctionCall';
import FunctionDefinitionType from './FunctionDefinitionType';

const arraySize: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence
) => {
	return zipSingleton([arraySequence], ([array]) =>
		sequenceFactory.singleton(
			createAtomicValue((array as ArrayValue).members.length, 'xs:integer')
		)
	);
};

const arrayPut: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence,
	positionSequence,
	itemSequence
) => {
	return zipSingleton([positionSequence, arraySequence], ([position, array]) => {
		const positionValue = position.value;
		if (positionValue <= 0 || positionValue > (array as ArrayValue).members.length) {
			throw new Error('FOAY0001: array position out of bounds.');
		}
		const newMembers = (array as ArrayValue).members.concat();
		newMembers.splice(positionValue - 1, 1, createDoublyIterableSequence(itemSequence));
		return sequenceFactory.singleton(new ArrayValue(newMembers));
	});
};

const arrayAppend: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence,
	itemSequence
) => {
	return zipSingleton([arraySequence], ([array]) => {
		const newMembers = (array as ArrayValue).members.concat([
			createDoublyIterableSequence(itemSequence),
		]);
		return sequenceFactory.singleton(new ArrayValue(newMembers));
	});
};

const arraySubarray: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence,
	startSequence,
	lengthSequence
) => {
	return zipSingleton(
		[arraySequence, startSequence, lengthSequence],
		([array, start, length]) => {
			const startValue = start.value;
			const lengthValue = length.value;

			if (startValue > (array as ArrayValue).members.length || startValue <= 0) {
				throw new Error('FOAY0001: subarray start out of bounds.');
			}

			if (lengthValue < 0) {
				throw new Error('FOAY0002: subarray length out of bounds.');
			}

			if (startValue + lengthValue > (array as ArrayValue).members.length + 1) {
				throw new Error('FOAY0001: subarray start + length out of bounds.');
			}

			const newMembers = (array as ArrayValue).members.slice(
				startValue - 1,
				lengthValue + startValue - 1
			);
			return sequenceFactory.singleton(new ArrayValue(newMembers));
		}
	);
};

const arrayRemove: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence,
	positionSequence
) => {
	return zipSingleton([arraySequence], ([array]) =>
		positionSequence.mapAll((allIndices) => {
			const indicesToRemove = allIndices
				.map((value) => value.value)
				// Sort them in reverse order, to keep them stable
				.sort((a, b) => b - a)
				.filter((item, i, all) => all[i - 1] !== item);

			const newMembers = (array as ArrayValue).members.concat();
			for (let i = 0, l = indicesToRemove.length; i < l; ++i) {
				const position = indicesToRemove[i];
				if (position > (array as ArrayValue).members.length || position <= 0) {
					throw new Error('FOAY0001: subarray position out of bounds.');
				}
				newMembers.splice(position - 1, 1);
			}

			return sequenceFactory.singleton(new ArrayValue(newMembers));
		})
	);
};

const arrayInsertBefore: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence,
	positionSequence,
	itemSequence
) => {
	return zipSingleton([arraySequence, positionSequence], ([array, position]) => {
		const positionValue = position.value;

		if (positionValue > (array as ArrayValue).members.length + 1 || positionValue <= 0) {
			throw new Error('FOAY0001: subarray position out of bounds.');
		}

		const newMembers = (array as ArrayValue).members.concat();
		newMembers.splice(positionValue - 1, 0, createDoublyIterableSequence(itemSequence));
		return sequenceFactory.singleton(new ArrayValue(newMembers));
	});
};

const arrayReverse: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence
) => {
	return zipSingleton([arraySequence], ([array]) =>
		sequenceFactory.singleton(new ArrayValue((array as ArrayValue).members.concat().reverse()))
	);
};

const arrayJoin: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence
) => {
	return arraySequence.mapAll((allArrays) => {
		const newMembers = allArrays.reduce(
			(joinedMembers, array) => joinedMembers.concat((array as ArrayValue).members),
			[]
		);
		return sequenceFactory.singleton(new ArrayValue(newMembers));
	});
};

const arrayForEach: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	arraySequence,
	itemSequence
) => {
	return zipSingleton([arraySequence, itemSequence], ([array, item]) => {
		const itemFunctionValue = item as FunctionValue;
		if (itemFunctionValue.getArity() !== 1) {
			throw errXPTY0004('The callback passed into array:for-each has a wrong arity.');
		}
		const newMembers = (array as ArrayValue).members.map((member) => {
			return createDoublyIterableSequence(
				itemFunctionValue.value.call(
					undefined,
					dynamicContext,
					executionParameters,
					staticContext,
					transformArgumentList(
						itemFunctionValue.getArgumentTypes() as TypeDeclaration[],
						[member()],
						executionParameters,
						'array:for-each'
					)[0]
				)
			);
		});
		return sequenceFactory.singleton(new ArrayValue(newMembers));
	});
};

const arrayFilter: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	arraySequence,
	itemSequence
) => {
	return zipSingleton([arraySequence, itemSequence], ([array, item]) => {
		const itemFunctionValue = item as FunctionValue;
		if (itemFunctionValue.getArity() !== 1) {
			throw errXPTY0004('The callback passed into array:filter has a wrong arity.');
		}
		const filterResultSequences: ISequence[] = (array as ArrayValue).members.map((member) => {
			const castArgument = transformArgumentList(
				itemFunctionValue.getArgumentTypes() as TypeDeclaration[],
				[member()],
				executionParameters,
				'array:filter'
			)[0];

			return item.value.call(
				undefined,
				dynamicContext,
				executionParameters,
				staticContext,
				castArgument
			);
		});

		const effectiveBooleanValues = [];
		let done = false;
		return sequenceFactory.create({
			next: () => {
				if (done) {
					return DONE_TOKEN;
				}
				let allReady = true;
				for (let i = 0, l = (array as ArrayValue).members.length; i < l; ++i) {
					if (effectiveBooleanValues[i] && effectiveBooleanValues[i].ready) {
						continue;
					}
					const filterResult = filterResultSequences[i];
					const ebv = filterResult.tryGetEffectiveBooleanValue();
					if (!ebv.ready) {
						allReady = false;
					}
					effectiveBooleanValues[i] = ebv;
				}
				if (!allReady) {
					return notReady(
						Promise.all(
							effectiveBooleanValues.map((filterResult) =>
								filterResult.ready ? Promise.resolve() : filterResult.promise
							)
						).then((_) => undefined)
					);
				}
				const newMembers = (array as ArrayValue).members.filter(
					(_, i) => effectiveBooleanValues[i].value
				);
				done = true;
				return ready(new ArrayValue(newMembers));
			},
		});
	});
};

const arrayFoldLeft: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	arraySequence,
	startSequence,
	itemSequence
) => {
	return zipSingleton([arraySequence, itemSequence], ([array, item]) => {
		const itemFunctionValue = item as FunctionValue;
		if (itemFunctionValue.getArity() !== 2) {
			throw errXPTY0004('The callback passed into array:fold-left has a wrong arity.');
		}

		return (array as ArrayValue).members.reduce((accum, member) => {
			const castMember = transformArgumentList(
				itemFunctionValue.getArgumentTypes() as TypeDeclaration[],
				[member()],
				executionParameters,
				'array:fold-left'
			)[0];

			return item.value.call(
				undefined,
				dynamicContext,
				executionParameters,
				staticContext,
				accum,
				castMember
			);
		}, startSequence);
	});
};

const arrayFoldRight: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	arraySequence,
	startSequence,
	itemSequence
) => {
	return zipSingleton([arraySequence, itemSequence], ([array, item]) => {
		const itemFunctionValue = item as FunctionValue;
		if (itemFunctionValue.getArity() !== 2) {
			throw errXPTY0004('The callback passed into array:fold-right has a wrong arity.');
		}

		return (array as ArrayValue).members.reduceRight((accum, member) => {
			const castMember = transformArgumentList(
				itemFunctionValue.getArgumentTypes() as TypeDeclaration[],
				[member()],
				executionParameters,
				'array:fold-right'
			)[0];

			return item.value.call(
				undefined,
				dynamicContext,
				executionParameters,
				staticContext,
				accum,
				castMember
			);
		}, startSequence);
	});
};

const arrayForEachPair: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	arraySequenceA,
	arraySequenceB,
	itemSequence
) => {
	return zipSingleton(
		[arraySequenceA, arraySequenceB, itemSequence],
		([arrayA, arrayB, item]) => {
			const itemFunctionValue = item as FunctionValue;
			if (itemFunctionValue.getArity() !== 2) {
				throw errXPTY0004(
					'The callback passed into array:for-each-pair has a wrong arity.'
				);
			}

			const newMembers = [];
			for (
				let i = 0,
					l = Math.min(
						(arrayA as ArrayValue).members.length,
						(arrayB as ArrayValue).members.length
					);
				i < l;
				++i
			) {
				const [argumentA, argumentB] = transformArgumentList(
					itemFunctionValue.getArgumentTypes() as TypeDeclaration[],
					[(arrayA as ArrayValue).members[i](), (arrayB as ArrayValue).members[i]()],
					executionParameters,
					'array:for-each-pair'
				);

				newMembers[i] = createDoublyIterableSequence(
					itemFunctionValue.value.call(
						undefined,
						dynamicContext,
						executionParameters,
						staticContext,
						argumentA,
						argumentB
					)
				);
			}

			return sequenceFactory.singleton(new ArrayValue(newMembers));
		}
	);
};

const isString = (type: string): boolean => {
	return (
		isSubtypeOf(type, 'xs:string') ||
		isSubtypeOf(type, 'xs:anyURI') ||
		isSubtypeOf(type, 'xs:untypedAtomic')
	);
};

const deepLessThan = (
	dynamicContext,
	executionParameters,
	staticContext,
	valuesA: Value[],
	valuesB: Value[]
): boolean => {
	if (valuesA.length === 0) {
		return valuesB.length !== 0;
	} else if (
		valuesB.length !== 0 &&
		itemDeepEqual(
			dynamicContext,
			executionParameters,
			staticContext,
			valuesA[0],
			valuesB[0]
		).next(IterationHint.NONE).value
	) {
		return deepLessThan(
			dynamicContext,
			executionParameters,
			staticContext,
			valuesA.slice(1),
			valuesB.slice(1)
		);
	} else if (valuesA[0].value !== valuesA[0].value) {
		return true;
	} else if (isString(valuesA[0].type) && valuesB.length !== 0 && isString(valuesB[0].type)) {
		return valuesA[0].value < valuesB[0].value;
	} else {
		return valuesB.length === 0 ? false : valuesA[0].value < valuesB[0].value;
	}
};

const arraySortCallback = (
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	allValues: IAsyncResult<Value[]>[]
) => {
	allValues.sort((valuesA, valuesB) => {
		const areSequencesEqual = sequenceDeepEqual(
			dynamicContext,
			executionParameters,
			staticContext,
			sequenceFactory.create(valuesA.value),
			sequenceFactory.create(valuesB.value)
		).next(IterationHint.NONE).value;

		if (areSequencesEqual) {
			return 0;
		}

		return deepLessThan(
			dynamicContext,
			executionParameters,
			staticContext,
			valuesA.value,
			valuesB.value
		)
			? -1
			: 1;
	});

	return sequenceFactory.singleton(
		new ArrayValue(allValues.map((item) => () => sequenceFactory.create(item.value)))
	);
};
const arraySort: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	arraySequence
) => {
	return zipSingleton([arraySequence], ([array]: [ArrayValue]) => {
		const allValues: IAsyncResult<Value[]>[] = array.members.map((i) => i().tryGetAllValues());

		// If all values are ready, resolve immediately
		if (allValues.every((val) => val.ready)) {
			return arraySortCallback(dynamicContext, executionParameters, staticContext, allValues);
		}

		let iterator: IAsyncIterator<Value> = null;
		return sequenceFactory.create({
			next: (hint: IterationHint) => {
				if (iterator === null) {
					let allReady = true;
					for (let i = 0, l = allValues.length; i < l; ++i) {
						if (allValues[i].ready) {
							continue;
						}
						const val = (allValues[i] = array.members[i]().tryGetAllValues());
						if (!val.ready) {
							allReady = false;
							return notReady(val.promise);
						}
					}
					if (allReady) {
						iterator = arraySortCallback(
							dynamicContext,
							executionParameters,
							staticContext,
							allValues
						).value;
					}
				}
				return iterator.next(hint);
			},
		});
	});
};

const arrayFlatten: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	itemSequence
) => {
	return itemSequence.mapAll((items) =>
		items.reduce(function flattenitem(flatteneditems, item) {
			if (isSubtypeOf(item.type, 'array(*)')) {
				return (item as ArrayValue).members.reduce(
					(flatteneditemsOfMember, member) =>
						member().mapAll((allValues) =>
							allValues.reduce(flattenitem, flatteneditemsOfMember)
						),
					flatteneditems
				);
			}
			return concatSequences([flatteneditems, sequenceFactory.singleton(item)]);
		}, sequenceFactory.empty())
	);
};

export default {
	declarations: [
		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'size',
			argumentTypes: ['array(*)'],
			returnType: 'xs:integer',
			callFunction: arraySize,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'get',
			argumentTypes: ['array(*)', 'xs:integer'],
			returnType: 'item()*',
			callFunction: arrayGet,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'put',
			argumentTypes: ['array(*)', 'xs:integer', 'item()*'],
			returnType: 'array(*)',
			callFunction: arrayPut,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'append',
			argumentTypes: ['array(*)', 'item()*'],
			returnType: 'array(*)',
			callFunction: arrayAppend,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'subarray',
			argumentTypes: ['array(*)', 'xs:integer', 'xs:integer'],
			returnType: 'array(*)',
			callFunction: arraySubarray,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'subarray',
			argumentTypes: ['array(*)', 'xs:integer'],
			returnType: 'array(*)',
			callFunction(
				dynamicContext,
				executionParameters,
				staticContext,
				arraySequence,
				startSequence
			) {
				const lengthSequence = sequenceFactory.singleton(
					createAtomicValue(
						arraySequence.first().members.length - startSequence.first().value + 1,
						'xs:integer'
					)
				);
				return arraySubarray(
					dynamicContext,
					executionParameters,
					staticContext,
					arraySequence,
					startSequence,
					lengthSequence
				);
			},
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'remove',
			argumentTypes: ['array(*)', 'xs:integer*'],
			returnType: 'array(*)',
			callFunction: arrayRemove,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'insert-before',
			argumentTypes: ['array(*)', 'xs:integer', 'item()*'],
			returnType: 'array(*)',
			callFunction: arrayInsertBefore,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'head',
			argumentTypes: ['array(*)'],
			returnType: 'item()*',
			callFunction(dynamicContext, executionParameters, _staticContext, arraySequence) {
				return arrayGet(
					dynamicContext,
					executionParameters,
					_staticContext,
					arraySequence,
					sequenceFactory.singleton(createAtomicValue(1, 'xs:integer'))
				);
			},
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'tail',
			argumentTypes: ['array(*)'],
			returnType: 'item()*',
			callFunction(dynamicContext, executionParameters, _staticContext, arraySequence) {
				return arrayRemove(
					dynamicContext,
					executionParameters,
					_staticContext,
					arraySequence,
					sequenceFactory.singleton(createAtomicValue(1, 'xs:integer'))
				);
			},
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'reverse',
			argumentTypes: ['array(*)'],
			returnType: 'array(*)',
			callFunction: arrayReverse,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'join',
			argumentTypes: ['array(*)*'],
			returnType: 'array(*)',
			callFunction: arrayJoin,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'for-each',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', '(item()*) as item()*)]
			argumentTypes: ['array(*)', 'function(*)'],
			returnType: 'array(*)',
			callFunction: arrayForEach,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'filter',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', '(item()*) as xs:boolean)]
			argumentTypes: ['array(*)', 'function(*)'],
			returnType: 'array(*)',
			callFunction: arrayFilter,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'fold-left',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'item()*', '(item()*, item()*) as item())]
			argumentTypes: ['array(*)', 'item()*', 'function(*)'],
			returnType: 'item()*',
			callFunction: arrayFoldLeft,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'fold-right',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'item()*', '(item()*, item()*) as item())]
			argumentTypes: ['array(*)', 'item()*', 'function(*)'],
			returnType: 'item()*',
			callFunction: arrayFoldRight,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'for-each-pair',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'item()*', '(item()*, item()*) as item())]
			argumentTypes: ['array(*)', 'array(*)', 'function(*)'],
			returnType: 'array(*)',
			callFunction: arrayForEachPair,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'sort',
			argumentTypes: ['array(*)'],
			returnType: 'array(*)',
			callFunction: arraySort,
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'flatten',
			argumentTypes: ['item()*'],
			returnType: 'item()*',
			callFunction: arrayFlatten,
		},
	],
	s: {
		append: arrayAppend,
		flatten: arrayFlatten,
		foldLeft: arrayFoldLeft,
		foldRight: arrayFoldRight,
		forEach: arrayForEach,
		forEachPair: arrayForEachPair,
		filter: arrayFilter,
		get: arrayGet,
		insertBefore: arrayInsertBefore,
		join: arrayJoin,
		put: arrayPut,
		remove: arrayRemove,
		reverse: arrayReverse,
		size: arraySize,
		sort: arraySort,
		subArray: arraySubarray,
	},
};
