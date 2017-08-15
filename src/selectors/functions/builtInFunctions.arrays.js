import arrayGet from './builtInFunctions.arrays.get';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ArrayValue from '../dataTypes/ArrayValue';
import zipSingleton from '../util/zipSingleton';
import concatSequences from '../util/concatSequences';
import { DONE_TOKEN, ready } from '../util/iterators';

function arraySize (_dynamicContext, arraySequence) {
	return zipSingleton(
		[arraySequence],
		([array]) => Sequence.singleton(createAtomicValue(array.members.length, 'xs:integer')));
}

function arrayPut (_dynamicContext, arraySequence, positionSequence, itemSequence) {
	return zipSingleton(
		[positionSequence, arraySequence],
		([position, array]) => {
			const positionValue = position.value;
			if (positionValue <= 0 || positionValue > array.members.length) {
				throw new Error('FOAY0001: array position out of bounds.');
			}
			const newMembers = array.members.concat();
			newMembers.splice(positionValue - 1, 1, itemSequence);
			return Sequence.singleton(new ArrayValue(newMembers));
		});
}

function arrayAppend (_dynamicContext, arraySequence, itemSequence) {
	return zipSingleton(
		[arraySequence],
		([array]) => {
			const newMembers = array.members.concat([itemSequence]);
			return Sequence.singleton(new ArrayValue(newMembers));
		});
}

function arraySubarray (_dynamicContext, arraySequence, startSequence, lengthSequence) {
	return zipSingleton(
		[arraySequence, startSequence, lengthSequence],
		([array, start, length]) => {
			const startValue = start.value;
			const lengthValue = length.value;

			if (startValue > array.members.length || startValue <= 0) {
				throw new Error('FOAY0001: subarray start out of bounds.');
			}

			if (lengthValue < 0) {
				throw new Error('FOAY0002: subarray length out of bounds.');
			}

			if (startValue + lengthValue > array.members.length + 1) {
				throw new Error('FOAY0001: subarray start + length out of bounds.');
			}

			const newMembers = array.members.slice(startValue - 1, lengthValue + startValue - 1);
			return Sequence.singleton(new ArrayValue(newMembers));
		});
}

function arrayRemove (_dynamicContext, arraySequence, positionSequence) {
	return zipSingleton(
		[arraySequence],
		([array]) => positionSequence.mapAll(allIndices => {
			const indicesToRemove = allIndices.map(value => value.value)
			// Sort them in reverse order, to keep them stable
				.sort((a, b) => b - a)
				.filter((item, i, all) => all[i - 1] !== item);

			const newMembers = array.members.concat();
			for (let i = 0, l = indicesToRemove.length; i < l; ++i) {
				const position = indicesToRemove[i];
				if (position > array.members.length || position <= 0) {
					throw new Error('FOAY0001: subarray position out of bounds.');
				}
				newMembers.splice(position - 1, 1);
			}

			return Sequence.singleton(new ArrayValue(newMembers));
		})
	);
}

function arrayInsertBefore (_dynamicContext, arraySequence, positionSequence, itemSequence) {
	return zipSingleton(
		[arraySequence, positionSequence],
		([array, position]) => {
			const positionValue = position.value;

			if (positionValue > array.members.length + 1 || positionValue <= 0) {
				throw new Error('FOAY0001: subarray position out of bounds.');
			}

			const newMembers = array.members.concat();
			newMembers.splice(positionValue - 1, 0, itemSequence);
			return Sequence.singleton(new ArrayValue(newMembers));
		});
}

function arrayReverse (_dynamicContext, arraySequence) {
	return zipSingleton(
		[arraySequence],
		([array]) => Sequence.singleton(new ArrayValue(array.members.concat().reverse())));
}

function arrayJoin (_dynamicContext, arraySequence) {
	return arraySequence.mapAll(allArrays => {
		const newMembers = allArrays.reduce(
			(joinedMembers, array) => joinedMembers.concat(array.members),
			[]);
		return Sequence.singleton(new ArrayValue(newMembers));
	});
}

function arrayForEach (dynamicContext, arraySequence, functionItemSequence) {
	return zipSingleton(
		[arraySequence, functionItemSequence],
		([array, functionItem]) => {
			const newMembers = array.members.map(function (member) {
				return functionItem.value.call(undefined, dynamicContext, member);
			});
			return Sequence.singleton(new ArrayValue(newMembers));
		});
}

function arrayFilter (dynamicContext, arraySequence, functionItemSequence) {
	return zipSingleton(
		[arraySequence, functionItemSequence],
		([array, functionItem]) => {
			/**
			 * @type {!Array<!Sequence>}
			 */
			const filterResultSequences = array.members.map(member => functionItem.value.call(
				undefined,
				dynamicContext,
				member));
			const effectiveBooleanValues = [];
			let done = false;
			return new Sequence({
				next: () => {
					if (done) {
						return DONE_TOKEN;
					}
					let allReady = true;
					for (let i = 0, l = array.members.length; i < l; ++i) {
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
						return {
							done: false,
							ready: false,
							promise: Promise.all(effectiveBooleanValues.map(
								filterResult => filterResult.ready ? Promise.resolve() : filterResult.promise))
						};
					}
					const newMembers = array.members.filter((_, i) => effectiveBooleanValues[i].value);
					done = true;
					return ready(new ArrayValue(newMembers));
				}
			});
		});
}

function arrayFoldLeft (dynamicContext, arraySequence, startSequence, functionItemSequence) {
	return zipSingleton(
		[arraySequence, functionItemSequence],
		([array, functionItem]) => array.members.reduce(
			(accum, member) => functionItem.value.call(undefined, dynamicContext, accum, member),
			startSequence));
}

function arrayFoldRight (dynamicContext, arraySequence, startSequence, functionItemSequence) {
	return zipSingleton(
		[arraySequence, functionItemSequence],
		([array, functionItem]) => array.members.reduceRight(
			(accum, member) => functionItem.value.call(undefined, dynamicContext, accum, member),
			startSequence));
}

function arrayForEachPair (dynamicContext, arraySequenceA, arraySequenceB, functionItemSequence) {
	return zipSingleton(
		[arraySequenceA, arraySequenceB, functionItemSequence],
		([arrayA, arrayB, functionItem]) => {
			const newMembers = [];
			for (let i = 0, l = Math.min(arrayA.members.length, arrayB.members.length); i < l; ++i) {
				newMembers[i] = functionItem.value.call(undefined, dynamicContext, arrayA.members[i], arrayB.members[i]);
			}

			return Sequence.singleton(new ArrayValue(newMembers));
		});
}

function arraySort (dynamicContext, arraySequence) {
	return zipSingleton(
		[arraySequence],
		([array]) => {
			const atomizedMembers = array.members.map(member => member.atomize(dynamicContext));
			return zipSingleton(
				atomizedMembers,
				atomizedItems => {
					const permutations = array.members
						.map((_, i) => i)
						.sort((indexA, indexB) => atomizedItems[indexA].value > atomizedItems[indexB].value ? 1 : -1);
					return Sequence.singleton(
						new ArrayValue(permutations.map(i => array.members[i]))
					);
				});
		});
}

function arrayFlatten (_dynamicContext, itemSequence) {
	return itemSequence.mapAll(items => items.reduce(function flattenItem (flattenedItems, item) {
		if (isSubtypeOf(item.type, 'array(*)')) {
			return item.members.reduce(
				(flattenedItemsOfMember, member) => member.mapAll(
					allValues => allValues.reduce(flattenItem, flattenedItemsOfMember)),
				flattenedItems);
		}
		return concatSequences([flattenedItems, Sequence.singleton(item)]);
	}, Sequence.empty()));
}

export default {
	declarations: [
		{
			name: 'array:size',
			argumentTypes: ['array(*)'],
			returnType: 'xs:integer',
			callFunction: arraySize
		},

		{
			name: 'array:get',
			argumentTypes: ['array(*)', 'xs:integer'],
			returnType: 'item()*',
			callFunction: arrayGet
		},

		{
			name: 'array:put',
			argumentTypes: ['array(*)', 'xs:integer', 'item()*'],
			returnType: 'array(*)',
			callFunction: arrayPut
		},

		{
			name: 'array:append',
			argumentTypes: ['array(*)', 'item()*'],
			returnType: 'array(*)',
			callFunction: arrayAppend
		},

		{
			name: 'array:subarray',
			argumentTypes: ['array(*)', 'xs:integer', 'xs:integer'],
			returnType: 'array(*)',
			callFunction: arraySubarray
		},

		{
			name: 'array:subarray',
			argumentTypes: ['array(*)', 'xs:integer'],
			returnType: 'array(*)',
			callFunction: function (dynamicContext, arraySequence, startSequence) {
				const lengthSequence = Sequence.singleton(createAtomicValue(
					arraySequence.first().members.length - startSequence.first().value + 1,
					'xs:integer'));
				return arraySubarray(
					dynamicContext,
					arraySequence,
					startSequence,
					lengthSequence);
			}
		},

		{
			name: 'array:remove',
			argumentTypes: ['array(*)', 'xs:integer*'],
			returnType: 'array(*)',
			callFunction: arrayRemove
		},

		{
			name: 'array:insert-before',
			argumentTypes: ['array(*)', 'xs:integer', 'item()*'],
			returnType: 'array(*)',
			callFunction: arrayInsertBefore
		},

		{
			name: 'array:head',
			argumentTypes: ['array(*)'],
			returnType: 'item()*',
			callFunction: function (dynamicContext, arraySequence) {
				return arrayGet(dynamicContext, arraySequence, Sequence.singleton(createAtomicValue(1, 'xs:integer')));
			}
		},

		{
			name: 'array:tail',
			argumentTypes: ['array(*)'],
			returnType: 'item()*',
			callFunction: function (dynamicContext, arraySequence) {
				return arrayRemove(dynamicContext, arraySequence, Sequence.singleton(createAtomicValue(1, 'xs:integer')));
			}
		},

		{
			name: 'array:reverse',
			argumentTypes: ['array(*)'],
			returnType: 'array(*)',
			callFunction: arrayReverse
		},

		{
			name: 'array:join',
			argumentTypes: ['array(*)*'],
			returnType: 'array(*)',
			callFunction: arrayJoin
		},

		{
			name: 'array:for-each',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'function(item()*) as item()*)]
			argumentTypes: ['array(*)', 'function(*)'],
			returnType: 'array(*)',
			callFunction: arrayForEach
		},

		{
			name: 'array:filter',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'function(item()*) as xs:boolean)]
			argumentTypes: ['array(*)', 'function(*)'],
			returnType: 'array(*)',
			callFunction: arrayFilter
		},

		{
			name: 'array:fold-left',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'item()*', 'function(item()*, item()*) as item())]
			argumentTypes: ['array(*)', 'item()*', 'function(*)'],
			returnType: 'item()*',
			callFunction: arrayFoldLeft
		},

		{
			name: 'array:fold-right',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'item()*', 'function(item()*, item()*) as item())]
			argumentTypes: ['array(*)', 'item()*', 'function(*)'],
			returnType: 'item()*',
			callFunction: arrayFoldRight
		},

		{
			name: 'array:for-each-pair',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['array(*)', 'item()*', 'function(item()*, item()*) as item())]
			argumentTypes: ['array(*)', 'array(*)', 'function(*)'],
			returnType: 'array(*)',
			callFunction: arrayForEachPair
		},

		{
			name: 'array:sort',
			argumentTypes: ['array(*)'],
			returnType: 'array(*)',
			callFunction: arraySort
		},

		{
			name: 'array:flatten',
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
		subarray: arraySubarray
	}
};
