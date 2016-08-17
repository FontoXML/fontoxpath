define([
	'./Value'
], function (
	Value
) {
	'use strict';

	function AnyAtomicValue (value, primitiveType) {
		Value.call(this, value);
		this.primitiveType = primitiveType;
	}

	AnyAtomicValue.prototype = Object.create(Value.prototype);
	AnyAtomicValue.prototype.constructor = AnyAtomicValue;

	AnyAtomicValue.cast = function (value) {
		return new AnyAtomicValue(value.value + '');
	};

	AnyAtomicValue.prototype.atomize = function () {
		return this;
	};

	return AnyAtomicValue;
});
