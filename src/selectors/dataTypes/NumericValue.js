define([
	'./AnyAtomicValue'
], function (
	AnyAtomicValue
) {
	'use strict';

	/**
	 * Abstract Numeric class, primary type for everything which is numeric: decimal, double and float
	 */
	function NumericValue (initialValue) {
		AnyAtomicValue.call(this, initialValue);
	}

	NumericValue.prototype = Object.create(AnyAtomicValue.prototype);
	NumericValue.prototype.constructor = NumericValue;

	NumericValue.cast = function (value) {
		var anyAtomicValue = AnyAtomicValue.cast(value);
		var floatValue = parseFloat(anyAtomicValue.value, 10);

		return new NumericValue(floatValue);
	};

	NumericValue.prototype.getEffectiveBooleanValue = function () {
		return this.value !== 0 && !Number.isNaN(this.value);
	};

	NumericValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === 'xs:numeric' ||
			AnyAtomicValue.prototype.instanceOfType(simpleTypeName);
	};

	return NumericValue;
});
