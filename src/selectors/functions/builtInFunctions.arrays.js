import arrayGet from './builtInFunctions.arrays.get';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ArrayValue from '../dataTypes/ArrayValue';

function arraySize (_dynamicContext, arraySequence) {
	return Sequence.singleton(createAtomicValue(arraySequence.first().members.length, 'xs:integer'));
}

function arrayPut (_dynamicContext, arraySequence, positionSequence, itemSequence) {
	const position = positionSequence.first().value;
	const array = arraySequence.first();
	if (position <= 0 || position > array.members.length) {
		throw new Error('FOAY0001: array position out of bounds.');
	}
	const newMembers = array.members.concat();
	newMembers.splice(position - 1, 1, itemSequence);
	return Sequence.singleton(new ArrayValue(newMembers));
}

function arrayAppend (_dynamicContext, arraySequence, itemSequence) {
	const array = arraySequence.first();
	const newMembers = array.members.concat([itemSequence]);
	return Sequence.singleton(new ArrayValue(newMembers));
}

function arraySubarray (_dynamicContext, arraySequence, startSequence, lengthSequence) {
	const array = arraySequence.first();
	const start = startSequence.first().value;
	const length = lengthSequence.first().value;

	if (start > array.members.length || start <= 0) {
		throw new Error('FOAY0001: subarray start out of bounds.');
	}

	if (length < 0) {
		throw new Error('FOAY0002: subarray length out of bounds.');
	}

	if (start + length > array.members.length + 1) {
		throw new Error('FOAY0001: subarray start + length out of bounds.');
	}

	const newMembers = array.members.slice(start - 1, length - start + 1);
	return Sequence.singleton(new ArrayValue(newMembers));
}

function arrayRemove (_dynamicContext, arraySequence, positionSequence) {
	const array = arraySequence.first();
	const indicesToRemove = positionSequence.getAllValues()
		.map(value => value.value)
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
}

function arrayInsertBefore (_dynamicContext, arraySequence, positionSequence, itemSequence) {
	const array = arraySequence.first();
	const position = positionSequence.first().value;

	if (position > array.members.length + 1 || position <= 0) {
		throw new Error('FOAY0001: subarray position out of bounds.');
	}

	const newMembers = array.members.concat();
	newMembers.splice(position - 1, 0, itemSequence);
	return Sequence.singleton(new ArrayValue(newMembers));
}

function arrayReverse (_dynamicContext, arraySequence) {
	const array = arraySequence.first();
	const newMembers = array.members.concat();
	newMembers.reverse();
	return Sequence.singleton(new ArrayValue(newMembers));
}

function arrayJoin (_dynamicContext, arraySequence) {
	const newMembers = arraySequence.getAllValues().reduce(function (joinedMembers, array) {
		return joinedMembers.concat(array.members);
	}, []);
	return Sequence.singleton(new ArrayValue(newMembers));
}

function arrayForEach (dynamicContext, arraySequence, functionItemSequence) {
	/**
	 * @type {../dataTypes/FunctionValue}
	 */
	const cb = functionItemSequence.first();
	const newMembers = arraySequence.first().members.map(function (member) {
		return cb.value.call(undefined, dynamicContext, member);
	});
	return Sequence.singleton(new ArrayValue(newMembers));
}

function arrayFilter (dynamicContext, arraySequence, functionItemSequence) {
	/**
	 * @type {../dataTypes/FunctionValue}
	 */
	const cb = functionItemSequence.first();
	const newMembers = arraySequence.first().members.filter(function (member) {
		return cb.value.call(undefined, dynamicContext, member).getEffectiveBooleanValue();
	});
	return Sequence.singleton(new ArrayValue(newMembers));
}

function arrayFoldLeft (dynamicContext, arraySequence, startSequence, functionItemSequence) {
	/**
	 * @type {../dataTypes/FunctionValue}
	 */
	const cb = functionItemSequence.first();
	return arraySequence.first().members.reduce(function (accum, member) {
		return cb.value.call(undefined, dynamicContext, accum, member);
	}, startSequence);
}

function arrayFoldRight (dynamicContext, arraySequence, startSequence, functionItemSequence) {
	/**
	 * @type {../dataTypes/FunctionValue}
	 */
	const cb = functionItemSequence.first();
	return arraySequence.first().members.reduceRight(function (accum, member) {
		return cb.value.call(undefined, dynamicContext, accum, member);
	}, startSequence);
}

function arrayForEachPair (dynamicContext, arraySequenceA, arraySequenceB, functionItemSequence) {
	/**
	 * @type {../dataTypes/FunctionValue}
	 */
	const cb = functionItemSequence.first();
	const arrayA = arraySequenceA.first();
	const arrayB = arraySequenceB.first();
	const newMembers = [];
	for (let i = 0, l = Math.min(arrayA.members.length, arrayB.members.length); i < l; ++i) {
		newMembers[i] = cb.value.call(undefined, dynamicContext, arrayA.members[i], arrayB.members[i]);
	}

	return Sequence.singleton(new ArrayValue(newMembers));
}

function arraySort (dynamicContext, arraySequence) {
	const array = arraySequence.first();
	const newMembers = array.members.concat().sort(function (memberA, memberB) {
		return memberA.atomize(dynamicContext).first().value > memberB.atomize(dynamicContext).first().value ? 1 : -1;
	});

	return Sequence.singleton(new ArrayValue(newMembers));
}


function arrayFlatten (dynamicContext, itemSequence) {
	let resultSequenceItems = [];

	itemSequence.getAllValues().forEach(function (item) {
		if (isSubtypeOf(item.type, 'array(*)')) {
			item.members.forEach(function (member) {
				const flattenedSequence = arrayFlatten(dynamicContext, member);
				resultSequenceItems = resultSequenceItems.concat(flattenedSequence.getAllValues());
			});
			return;
		}
		resultSequenceItems.push(item);
	});
	return new Sequence(resultSequenceItems);
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
