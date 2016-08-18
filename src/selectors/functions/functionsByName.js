define([
	'../dataTypes/Sequence',
	'../dataTypes/BooleanValue',
	'../dataTypes/StringValue',
	'../dataTypes/IntegerValue'
], function (
	Sequence,
	BooleanValue,
	StringValue,
	IntegerValue
) {
	'use strict';

	// Functions are given the following arguments:
	// function (blueprint:Blueprint, contextSequence:Sequence, contextItem:Item, (argument:Sequence)..) {
	//
	// }
	return {
		not: function (blueprint, contextSequence, contextItem, sequence) {
			if (!sequence) {
				throw new Error('No such function not(). Did you mean not($a as xs:sequence)?');
			}
			return Sequence.singleton(new BooleanValue(!sequence.getEffectiveBooleanValue()));
		},
		true: function () {
			return Sequence.singleton(new BooleanValue(true));
		},
		false: function () {
			return Sequence.singleton(new BooleanValue(false));
		},
		count: function (blueprint, contextSequence, contextItem, sequence) {
			if (!sequence) {
				throw new Error('No such function count(). Did you mean count($a as xs:sequence)?');
			}
			return Sequence.singleton(new IntegerValue(sequence.value.length));
		},
		position: function (blueprint, contextSequence, contextItem) {
			// Note: +1 because XPath is one-based
			return Sequence.singleton(new IntegerValue(contextSequence.value.indexOf(contextItem) + 1));
		},
		last: function (blueprint, contextSequence, contextItem) {
			return Sequence.singleton(new IntegerValue(contextSequence.value.length));
		},
		range: function (blueprint, contextSequence, contextItem, fromValue, toValue) {
			if (!fromValue || !toValue || !fromValue.isSingleton() || !toValue.isSingleton()) {
				throw new Error('No such function range(). Did your mean range($a as xs:integer, $b as xs:integer)?');
			}

			var from = fromValue.value[0].value,
				to = toValue.value[0].value;

			if (from > to) {
				return Sequence.empty();
			}

			// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
			return new Sequence(new Array(to - from + 1).fill(0).map(function (_, i) {return new IntegerValue(from + i);}));
		},
		concat: function (blueprint, contextSequence, contextItem) {
			var stringSequences = Array.from(arguments).slice(3);
			if (!stringSequences.length) {
				throw new Error('No such function concat(). Did your mean concat($a as xs:anyAtomicValue, $a as xs:anyAtomicValue, ...)?');
			}

			stringSequences = stringSequences.map(function (sequence) { return sequence.atomize(); });
			var strings = stringSequences.map(function (sequence) {
					return sequence.value[0].value;
				});

			// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
			return Sequence.singleton(new StringValue(strings.join('')));
		}
	};
});
