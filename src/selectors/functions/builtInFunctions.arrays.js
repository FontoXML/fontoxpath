define([
	'./builtInFunctions.arrays.get',
	'../dataTypes/Sequence',
	'../dataTypes/ArrayValue',
	'../dataTypes/IntegerValue'
], function (
	arrayGet,
	Sequence,
	ArrayValue,
	IntegerValue
) {
	'use strict';

	function arraySize (_dynamicContext, arraySequence) {
		return Sequence.singleton(new IntegerValue(arraySequence.value[0].members.length));
	}

	function arrayPut (_dynamicContext, arraySequence, positionSequence, itemSequence) {
		var position = positionSequence.value[0].value,
			array = arraySequence.value[0];
		if (position <= 0 || position > array.members.length) {
			throw new Error('FOAY0001: array position out of bounds.');
		}
		var newMembers = array.members.concat();
		newMembers.splice(position - 1, 1, itemSequence);
		return Sequence.singleton(new ArrayValue(newMembers));
	}

	function arrayAppend (_dynamicContext, arraySequence, itemSequence) {
		var array = arraySequence.value[0];
		var newMembers = array.members.concat([itemSequence]);
		return Sequence.singleton(new ArrayValue(newMembers));
	}

	function arraySubarray (_dynamicContext, arraySequence, startSequence, lengthSequence) {
		var array = arraySequence.value[0];
		var start = startSequence.value[0].value;
		var length = lengthSequence.value[0].value;

		if (start > array.members.length || start <= 0) {
			throw new Error('FOAY0001: subarray start out of bounds.');
		}

		if (length < 0) {
			throw new Error('FOAY0002: subarray length out of bounds.');
		}

		if (start + length > array.members.length + 1) {
			throw new Error('FOAY0001: subarray start + length out of bounds.');
		}

		var newMembers = array.members.slice(start - 1, length - start + 1);
		return Sequence.singleton(new ArrayValue(newMembers));
	}

	function arrayRemove (_dynamicContext, arraySequence, positionSequence) {
		var array = arraySequence.value[0];
		var indicesToRemove = positionSequence.value.map(function (value) {
				return value.value;
			})
			.sort(function (a, b) {
				// Sort them in reverse order, to keep them stable
				return a < b;
			})
			.filter(function (item, i, all) {
				return all[i - 1] !== item;
			});

		var newMembers = array.members.concat();
		for (var i = 0, l = indicesToRemove.length; i < l; ++i) {
			var position = indicesToRemove[i];
			if (position > array.members.length || position <= 0) {
				throw new Error('FOAY0001: subarray position out of bounds.');
			}
			newMembers.splice(position - 1, 1);
		}

		return Sequence.singleton(new ArrayValue(newMembers));
	}

	function arrayInsertBefore (_dynamicContext, arraySequence, positionSequence, itemSequence) {
		var array = arraySequence.value[0];
		var position = positionSequence.value[0].value;

		if (position > array.members.length + 1 || position <= 0) {
			throw new Error('FOAY0001: subarray position out of bounds.');
		}

		var newMembers = array.members.concat();
		newMembers.splice(position - 1, 0, itemSequence);
		return Sequence.singleton(new ArrayValue(newMembers));
	}

	function arrayReverse (_dynamicContext, arraySequence) {
		var array = arraySequence.value[0];
		var newMembers = array.members.concat();
		newMembers.reverse();
		return Sequence.singleton(new ArrayValue(newMembers));
	}

	function arrayJoin (_dynamicContext, arraySequence) {
		var newMembers = arraySequence.value.reduce(function (joinedMembers, array) {
				return joinedMembers.concat(array.members);
			}, []);
		return Sequence.singleton(new ArrayValue(newMembers));
	}

	function arrayForEach (dynamicContext, arraySequence, functionItemSequence) {
		var cb = functionItemSequence.value[0].value;
		var newMembers = arraySequence.value[0].members.map(function (member) {
				return cb.call(undefined, dynamicContext, member);
			});
		return Sequence.singleton(new ArrayValue(newMembers));
	}

	function arrayFilter (dynamicContext, arraySequence, functionItemSequence) {
		var cb = functionItemSequence.value[0].value;
		var newMembers = arraySequence.value[0].members.filter(function (member) {
				return cb.call(undefined, dynamicContext, member).getEffectiveBooleanValue();
			});
		return Sequence.singleton(new ArrayValue(newMembers));
	}

	function arrayFoldLeft (dynamicContext, arraySequence, startSequence, functionItemSequence) {
		var cb = functionItemSequence.value[0].value;
		return arraySequence.value[0].members.reduce(function (accum, member) {
				return cb.call(undefined, dynamicContext, accum, member);
			}, startSequence);
	}

	function arrayFoldRight (dynamicContext, arraySequence, startSequence, functionItemSequence) {
		var cb = functionItemSequence.value[0].value;
		return arraySequence.value[0].members.reduceRight(function (accum, member) {
				return cb.call(undefined, dynamicContext, accum, member);
			}, startSequence);
	}

	function arrayForEachPair (dynamicContext, arraySequenceA, arraySequenceB, functionItemSequence) {
		var cb = functionItemSequence.value[0].value,
			arrayA = arraySequenceA.value[0],
			arrayB = arraySequenceB.value[0];
		var newMembers = [];
		for (var i = 0, l = Math.min(arrayA.members.length, arrayB.members.length); i < l; ++i) {
			newMembers[i] = cb.call(undefined, dynamicContext, arrayA.members[i], arrayB.members[i]);
		}

		return Sequence.singleton(new ArrayValue(newMembers));
	}

	function arraySort (_dynamicContext, arraySequence) {
		var array = arraySequence.value[0];
		var newMembers = array.members.concat().sort(function (memberA, memberB) {
				return memberA.atomize().value[0].value > memberB.atomize().value[0].value ? 1 : -1;
			});

		return Sequence.singleton(new ArrayValue(newMembers));
	}


	function arrayFlatten (dynamicContext, itemSequence) {
		var resultSequenceItems = [];
		itemSequence.value.forEach(function (item) {
			if (item.instanceOfType('array(*)')) {
				item.members.forEach(function (member) {
					var flattenedSequence = arrayFlatten(dynamicContext, member);
					resultSequenceItems = resultSequenceItems.concat(flattenedSequence.value);
				});
				return;
			}
			resultSequenceItems.push(item);
		});
		return new Sequence(resultSequenceItems);
	}


	return {
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
					var lengthSequence = Sequence.singleton(new IntegerValue(
							arraySequence.value[0].members.length - startSequence.value[0].value + 1));
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
					return arrayGet(dynamicContext, arraySequence, Sequence.singleton(new IntegerValue(1)));
				}
			},

			{
				name: 'array:tail',
				argumentTypes: ['array(*)'],
				returnType: 'item()*',
				callFunction: function (dynamicContext, arraySequence) {
					return arrayRemove(dynamicContext, arraySequence, Sequence.singleton(new IntegerValue(1)));
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
});
