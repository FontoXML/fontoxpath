define([
	'./AnyAtomicValue'
], function (
	AnyAtomicValue
) {
	/**
	 * Abstract Numeric class, primary type for everything which is numeric: decimal, double and float
	 */
	function NumericValue (initialValue, simpleType) {
		AnyAtomicValue.call(this, initialValue, simpleType);
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

	return NumericValue;
});
