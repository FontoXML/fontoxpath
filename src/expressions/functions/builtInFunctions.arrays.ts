import ArrayValue from '../dataTypes/ArrayValue';
import createAtomicValue from '../dataTypes/createAtomicValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import SequenceFactory from '../dataTypes/SequenceFactory';
import concatSequences from '../util/concatSequences';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import { DONE_TOKEN, notReady, ready } from '../util/iterators';
import zipSingleton from '../util/zipSingleton';
import arrayGet from './builtInFunctions.arrays.get';

import ISequence from '../dataTypes/ISequence';
import { ARRAY_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionDefinitionType from './FunctionDefinitionType';

const arraySize: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence
) {
	return zipSingleton([arraySequence], ([array]) =>
		SequenceFactory.singleton(
			createAtomicValue((array as ArrayValue).members.length, 'xs:integer')
		)
	);
};

const arrayPut: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence,
	positionSequence,
	itemSequence
) {
	return zipSingleton([positionSequence, arraySequence], ([position, array]) => {
		const positionValue = position.value;
		if (positionValue <= 0 || positionValue > (array as ArrayValue).members.length) {
			throw new Error('FOAY0001: array position out of bounds.');
		}
		const newMembers = (array as ArrayValue).members.concat();
		newMembers.splice(positionValue - 1, 1, createDoublyIterableSequence(itemSequence));
		return SequenceFactory.singleton(new ArrayValue(newMembers));
	});
};

const arrayAppend: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence,
	itemSequence
) {
	return zipSingleton([arraySequence], ([array]) => {
		const newMembers = (array as ArrayValue).members.concat([
			createDoublyIterableSequence(itemSequence)
		]);
		return SequenceFactory.singleton(new ArrayValue(newMembers));
	});
};

const arraySubarray: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence,
	startSequence,
	lengthSequence
) {
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
			return SequenceFactory.singleton(new ArrayValue(newMembers));
		}
	);
};

const arrayRemove: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence,
	positionSequence
) {
	return zipSingleton([arraySequence], ([array]) =>
		positionSequence.mapAll(allIndices => {
			const indicesToRemove = allIndices
				.map(value => value.value)
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

			return SequenceFactory.singleton(new ArrayValue(newMembers));
		})
	);
};

const arrayInsertBefore: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence,
	positionSequence,
	itemSequence
) {
	return zipSingleton([arraySequence, positionSequence], ([array, position]) => {
		const positionValue = position.value;

		if (positionValue > (array as ArrayValue).members.length + 1 || positionValue <= 0) {
			throw new Error('FOAY0001: subarray position out of bounds.');
		}

		const newMembers = (array as ArrayValue).members.concat();
		newMembers.splice(positionValue - 1, 0, createDoublyIterableSequence(itemSequence));
		return SequenceFactory.singleton(new ArrayValue(newMembers));
	});
};

const arrayReverse: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence
) {
	return zipSingleton([arraySequence], ([array]) =>
		SequenceFactory.singleton(new ArrayValue((array as ArrayValue).members.concat().reverse()))
	);
};

const arrayJoin: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence
) {
	return arraySequence.mapAll(allArrays => {
		const newMembers = allArrays.reduce(
			(joinedMembers, array) => joinedMembers.concat((array as ArrayValue).members),
			[]
		);
		return SequenceFactory.singleton(new ArrayValue(newMembers));
	});
};

const arrayForEach: FunctionDefinitionType = function(
	dynamicContext,
	executionParameters,
	staticContext,
	arraySequence,
	functionItemSequence
) {
	return zipSingleton([arraySequence, functionItemSequence], ([array, functionItem]) => {
		const newMembers = (array as ArrayValue).members.map(function(member) {
			return createDoublyIterableSequence(
				functionItem.value.call(
					undefined,
					dynamicContext,
					executionParameters,
					staticContext,
					member()
				)
			);
		});
		return SequenceFactory.singleton(new ArrayValue(newMembers));
	});
};

const arrayFilter: FunctionDefinitionType = function(
	dynamicContext,
	executionParameters,
	staticContext,
	arraySequence,
	functionItemSequence
) {
	return zipSingleton([arraySequence, functionItemSequence], ([array, functionItem]) => {
		const filterResultSequences: ISequence[] = (array as ArrayValue).members.map(member =>
			functionItem.value.call(
				undefined,
				dynamicContext,
				executionParameters,
				staticContext,
				member()
			)
		);
		const effectiveBooleanValues = [];
		let done = false;
		return SequenceFactory.create({
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
							effectiveBooleanValues.map(filterResult =>
								filterResult.ready ? Promise.resolve() : filterResult.promise
							)
						)
					);
				}
				const newMembers = (array as ArrayValue).members.filter(
					(_, i) => effectiveBooleanValues[i].value
				);
				done = true;
				return ready(new ArrayValue(newMembers));
			}
		});
	});
};

const arrayFoldLeft: FunctionDefinitionType = function(
	dynamicContext,
	executionParameters,
	staticContext,
	arraySequence,
	startSequence,
	functionItemSequence
) {
	return zipSingleton([arraySequence, functionItemSequence], ([array, functionItem]) =>
		(array as ArrayValue).members.reduce(
			(accum, member) =>
				functionItem.value.call(
					undefined,
					dynamicContext,
					executionParameters,
					staticContext,
					accum,
					member()
				),
			startSequence
		)
	);
};

const arrayFoldRight: FunctionDefinitionType = function(
	dynamicContext,
	executionParameters,
	staticContext,
	arraySequence,
	startSequence,
	functionItemSequence
) {
	return zipSingleton([arraySequence, functionItemSequence], ([array, functionItem]) =>
		(array as ArrayValue).members.reduceRight(
			(accum, member) =>
				functionItem.value.call(
					undefined,
					dynamicContext,
					executionParameters,
					staticContext,
					accum,
					member()
				),
			startSequence
		)
	);
};

const arrayForEachPair: FunctionDefinitionType = function(
	dynamicContext,
	executionParameters,
	staticContext,
	arraySequenceA,
	arraySequenceB,
	functionItemSequence
) {
	return zipSingleton(
		[arraySequenceA, arraySequenceB, functionItemSequence],
		([arrayA, arrayB, functionItem]) => {
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
				newMembers[i] = createDoublyIterableSequence(
					functionItem.value.call(
						undefined,
						dynamicContext,
						executionParameters,
						staticContext,
						(arrayA as ArrayValue).members[i](),
						(arrayB as ArrayValue).members[i]()
					)
				);
			}

			return SequenceFactory.singleton(new ArrayValue(newMembers));
		}
	);
};

const arraySort: FunctionDefinitionType = function(
	_dynamicContext,
	executionParameters,
	_staticContext,
	arraySequence
) {
	return zipSingleton([arraySequence], ([array]) => {
		const atomizedMembers = (array as ArrayValue).members.map(createSequence =>
			createSequence().atomize(executionParameters)
		);

		return zipSingleton(atomizedMembers, atomizedItems => {
			const permutations = (array as ArrayValue).members
				.map((_, i) => i)
				.sort((indexA, indexB) =>
					atomizedItems[indexA].value > atomizedItems[indexB].value ? 1 : -1
				);
			return SequenceFactory.singleton(
				new ArrayValue(permutations.map(i => (array as ArrayValue).members[i]))
			);
		});
	});
};

const arrayFlatten: FunctionDefinitionType = function(
	__dynamicContext,
	_executionParameters,
	_staticContext,
	itemSequence
) {
	return itemSequence.mapAll(items =>
		items.reduce(function flattenItem(flattenedItems, item) {
			if (isSubtypeOf(item.type, 'array(*)')) {
				return (item as ArrayValue).members.reduce(
					(flattenedItemsOfMember, member) =>
						member().mapAll(allValues =>
							allValues.reduce(flattenItem, flattenedItemsOfMember)
						),
					flattenedItems
				);
			}
			return concatSequences([flattenedItems, SequenceFactory.singleton(item)]);
		}, SequenceFactory.empty())
	);
};

export default {
	declarations: [
		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'size',
			argumentTypes: ['array(*)'],
			returnType: 'xs:integer',
			callFunction: arraySize
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'get',
			argumentTypes: ['array(*)', 'xs:integer'],
			returnType: 'item()*',
			callFunction: arrayGet
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'put',
			argumentTypes: ['array(*)', 'xs:integer', 'item()*'],
			returnType: 'array(*)',
			callFunction: arrayPut
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'append',
			argumentTypes: ['array(*)', 'item()*'],
			returnType: 'array(*)',
			callFunction: arrayAppend
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'subarray',
			argumentTypes: ['array(*)', 'xs:integer', 'xs:integer'],
			returnType: 'array(*)',
			callFunction: arraySubarray
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
				const lengthSequence = SequenceFactory.singleton(
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
			}
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'remove',
			argumentTypes: ['array(*)', 'xs:integer*'],
			returnType: 'array(*)',
			callFunction: arrayRemove
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'insert-before',
			argumentTypes: ['array(*)', 'xs:integer', 'item()*'],
			returnType: 'array(*)',
			callFunction: arrayInsertBefore
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
					SequenceFactory.singleton(createAtomicValue(1, 'xs:integer'))
				);
			}
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
					SequenceFactory.singleton(createAtomicValue(1, 'xs:integer'))
				);
			}
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'reverse',
			argumentTypes: ['array(*)'],
			returnType: 'array(*)',
			callFunction: arrayReverse
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'join',
			argumentTypes: ['array(*)*'],
			returnType: 'array(*)',
			callFunction: arrayJoin
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'for-each',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'function(item()*) as item()*)]
			argumentTypes: ['array(*)', 'function(*)'],
			returnType: 'array(*)',
			callFunction: arrayForEach
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'filter',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'function(item()*) as xs:boolean)]
			argumentTypes: ['array(*)', 'function(*)'],
			returnType: 'array(*)',
			callFunction: arrayFilter
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'fold-left',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'item()*', 'function(item()*, item()*) as item())]
			argumentTypes: ['array(*)', 'item()*', 'function(*)'],
			returnType: 'item()*',
			callFunction: arrayFoldLeft
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'fold-right',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'item()*', 'function(item()*, item()*) as item())]
			argumentTypes: ['array(*)', 'item()*', 'function(*)'],
			returnType: 'item()*',
			callFunction: arrayFoldRight
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'for-each-pair',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'item()*', 'function(item()*, item()*) as item())]
			argumentTypes: ['array(*)', 'array(*)', 'function(*)'],
			returnType: 'array(*)',
			callFunction: arrayForEachPair
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'sort',
			argumentTypes: ['array(*)'],
			returnType: 'array(*)',
			callFunction: arraySort
		},

		{
			namespaceURI: ARRAY_NAMESPACE_URI,
			localName: 'flatten',
			argumentTypes: ['item()*'],
			returnType: 'item()*',
			callFunction: arrayFlatten
		}
	],
	functions: {
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
		subArray: arraySubarray
	}
};
