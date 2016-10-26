define([
	'./Item'
], function (
	Item
) {
	'use strict';

	function AnyAtomicTypeValue (value) {
		Item.call(this, value);
	}

	AnyAtomicTypeValue.prototype = Object.create(Item.prototype);
	AnyAtomicTypeValue.prototype.constructor = AnyAtomicTypeValue;

	AnyAtomicTypeValue.cast = function (value) {
		return new AnyAtomicTypeValue(value.value + '');
	};

	AnyAtomicTypeValue.prototype.atomize = function () {
		return this;
	};

	AnyAtomicTypeValue.primitiveTypeName = AnyAtomicTypeValue.prototype.primitiveTypeName = 'xs:anyAtomicType';

	AnyAtomicTypeValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === 'xs:anyAtomicType' ||
			Item.prototype.instanceOfType.call(this, simpleTypeName);
	};

	return AnyAtomicTypeValue;
});
