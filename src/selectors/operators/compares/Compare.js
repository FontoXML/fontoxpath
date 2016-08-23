define([
	'../../dataTypes/Sequence',
	'../../dataTypes/BooleanValue',
	'../../Selector',

	'./generalCompare',
	'./valueCompare'
], function (
	Sequence,
	BooleanValue,
	Selector,

	generalCompare,
	valueCompare
) {
	'use strict';

	function Compare (kind, firstSelector, secondSelector) {
		Selector.call(this, firstSelector.specificity.add(secondSelector.specificity));
		this._firstSelector = firstSelector;
		this._secondSelector = secondSelector;

		this._operator = kind[1];

		switch (kind[0]) {
			case 'generalCompare':
				this._comparator = generalCompare;
				break;
			case 'valueCompare':
				this._comparator = valueCompare;
				break;
			case 'nodeCompare':
				throw new Error('NodeCompare is not implemented');
		}
	}

	Compare.prototype = Object.create(Selector.prototype);
	Compare.prototype.constructor = Compare;

	Compare.prototype.equals = function (otherSelector) {
		if (otherSelector === this) {
			return true;
		}
		return otherSelector instanceof Compare &&
			this._firstSelector.equals(otherSelector._firstSelector) &&
			this._firstSelector.equals(otherSelector._firstSelector);
	};

	Compare.prototype.evaluate = function (dynamicContext) {
		var firstSequence = this._firstSelector.evaluate(dynamicContext),
			secondSequence = this._secondSelector.evaluate(dynamicContext);

		// Atomize both sequences
		var firstAtomizedSequence = firstSequence.atomize();
		var secondAtomizedSequence = secondSequence.atomize();
		return Sequence.singleton(
			new BooleanValue(this._comparator(this._operator, firstAtomizedSequence, secondAtomizedSequence)));
	};

	return Compare;
});
