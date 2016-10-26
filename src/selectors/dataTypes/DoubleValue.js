define([
	'./NumericValue'
], function (
	NumericValue
) {
	'use strict';

	function DoubleValue (initialValue) {
		NumericValue.call(this, initialValue);
	}

	DoubleValue.prototype = Object.create(NumericValue.prototype);
	DoubleValue.prototype.constructor = DoubleValue;

	DoubleValue.cast = function (value) {
		if (value instanceof DoubleValue) {
			return new DoubleValue(value.value);
		}

		var numericValue = NumericValue.cast(value);
		return new DoubleValue(numericValue.value);
	};

	DoubleValue.primitiveTypeName = DoubleValue.prototype.primitiveTypeName = 'xs:double';

	DoubleValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === this.primitiveTypeName ||
			NumericValue.prototype.instanceOfType.call(this, simpleTypeName);
	};

	return DoubleValue;
});
