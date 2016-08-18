define([
	'../dataTypes/Sequence',
	'../dataTypes/BooleanValue',
	'../dataTypes/IntegerValue'
], function (
	Sequence,
	BooleanValue,
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
		}
	};
});
