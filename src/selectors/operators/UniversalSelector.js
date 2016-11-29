define([
	'../Selector',
	'../Specificity',
	'../dataTypes/Sequence',
	'../dataTypes/BooleanValue'
], function (
	Selector,
	Specificity,
	Sequence,
	BooleanValue
) {
	'use strict';

	/**
	 * Deprecated, only used for fluent syntax.
	 */
	function UniversalSelector () {
		Selector.call(
			this,
			new Specificity({universal: 1}),
			Selector.RESULT_ORDER_SORTED);
	}

	UniversalSelector.prototype = Object.create(Selector.prototype);
	UniversalSelector.prototype.constructor = UniversalSelector;

	UniversalSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof UniversalSelector;
	};

	UniversalSelector.prototype.evaluate = function () {
		return Sequence.singleton(BooleanValue.TRUE);
	};

	return UniversalSelector;
});
