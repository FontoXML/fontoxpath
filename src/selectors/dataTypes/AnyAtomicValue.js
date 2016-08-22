define([
	'./Value'
], function (
	Value
) {
	'use strict';

	function AnyAtomicValue (value) {
		Value.call(this, value);
	}

	AnyAtomicValue.prototype = Object.create(Value.prototype);
	AnyAtomicValue.prototype.constructor = AnyAtomicValue;

	AnyAtomicValue.cast = function (value) {
		return new AnyAtomicValue(value.value + '');
	};

	AnyAtomicValue.prototype.atomize = function () {
		return this;
	};

	AnyAtomicValue.primitiveTypeName = AnyAtomicValue.prototype.primitiveTypeName = 'xs:anyAtomicType';

	AnyAtomicValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === this.primitiveTypeName ||
			Value.prototype.instanceOfType(simpleTypeName);
	};

	return AnyAtomicValue;
});
