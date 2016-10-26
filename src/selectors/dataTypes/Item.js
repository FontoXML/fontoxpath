define([
], function (
) {
	'use strict';

	function Item (value) {
		this.value = value;
	}

	Item.prototype.atomize = function () {};

	Item.prototype.getEffectiveBooleanValue = function () {
		throw new Error('Not implemented');
	};

	Item.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === 'item()';
	};

	return Item;
});
