define([
	'../Selector',
	'../Specificity',
	'../dataTypes/ArrayValue',
	'../dataTypes/Sequence'
], function (
	Selector,
	Specificity,
	ArrayValue,
	Sequence
) {
	'use strict';

	/**
	 * @param  {string}      curlyness       Whether this constructor should use curly behaviour
	 *                                         Curly behaviour unfolds the single entry sequence, square constructor does not unfold
	 * @param  {Selector[]}  memberSelectors The selectors for the values
	 */
	function ArrayConstructor (curlyness, members) {
		Selector.call(this, new Specificity({ external: 1 }), Selector.RESULT_ORDER_UNSORTED);
		this._curlyness = curlyness;
		this._members = members;
	}

	ArrayConstructor.prototype = Object.create(Selector.prototype);
	ArrayConstructor.prototype.constructor = ArrayConstructor;

	ArrayConstructor.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof ArrayConstructor &&
			this._curlyness === otherSelector._curlyness &&
			this._members.length === otherSelector._members.length &&
			this._members.every(function (entry, i) {
				return otherSelector._members[i].equals(entry);
			});
	};

	ArrayConstructor.prototype.evaluate = function (dynamicContext) {
		if (this._curlyness === 'curly') {
			return Sequence.singleton(new ArrayValue(this._members[0].evaluate(dynamicContext).value.map(Sequence.singleton)));
		}

		return Sequence.singleton(new ArrayValue(this._members.map(
			function (entry) {
				return entry.evaluate(dynamicContext);
			})));
	};

	return ArrayConstructor;
});
