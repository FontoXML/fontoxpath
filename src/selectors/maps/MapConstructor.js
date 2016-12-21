define([
	'../Selector',
	'../Specificity',
	'../dataTypes/MapValue',
	'../dataTypes/Sequence'
], function (
	Selector,
	Specificity,
	MapValue,
	Sequence
) {
	'use strict';

	/**
	 * @param  {Object[]}    entries  key-value tuples of selectors which will evaluate to key / value pairs
	 */
	function MapConstructor (entries) {
		Selector.call(this, new Specificity({ external: 1 }), Selector.RESULT_ORDER_UNSORTED);
		this._entries = entries;
	}

	MapConstructor.prototype = Object.create(Selector.prototype);
	MapConstructor.prototype.constructor = MapConstructor;

	MapConstructor.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof MapConstructor &&
			this._entries.length === otherSelector._entries.length &&
			this._entries.every(function (keyValuePair, i) {
				return otherSelector._entries[i].key.equals(keyValuePair.key) &&
					otherSelector._entries[i].value.equals(keyValuePair.value);
			});
	};

	MapConstructor.prototype.evaluate = function (dynamicContext) {
		var keyValuePairs = this._entries.map(function (keyValuePair) {
				var keySequence = keyValuePair.key.evaluate(dynamicContext).atomize();
				if (!keySequence.isSingleton()) {
					throw new Error('XPTY0004: A key of a map should be a single atomizable value.');
				}
				return {
					key: keySequence.value[0],
					value: keyValuePair.value.evaluate(dynamicContext)
				};
			});

		return Sequence.singleton(new MapValue(keyValuePairs));
	};

	return MapConstructor;
});
