define([
	'../Selector',
	'../Specificity'
], function (
	Selector,
	Specificity
) {
	'use strict';

	/**
	 * @param  {Object[]}    entries  key-value tuples of selectors which will evaluate to key / value pairs
	 */
	function MapConstructor (entries) {
		Selector.call(this, new Specificity({external: 1}), Selector.RESULT_ORDER_UNSORTED);
		this._entries = entries;
	}

	MapConstructor.prototype = Object.create(Selector.prototype);
	MapConstructor.prototype.constructor = MapConstructor;

	MapConstructor.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof MapConstructor &&
			this._entries.length === otherSelector._entries &&
			this._entries.every(function (entry, i) { return otherSelector._entries[i].equals(entry);});
	};

	MapConstructor.prototype.evaluate = function (dynamicContext) {
		var map = this._entries.
	};

	return MapConstructor;
});
