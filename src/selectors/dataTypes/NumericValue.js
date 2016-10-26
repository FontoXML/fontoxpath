define([
	'./AnyAtomicTypeValue'
], function (
	AnyAtomicTypeValue
) {
	'use strict';

	/**
	 * Abstract Numeric class, primary type for everything which is numeric: decimal, double and float
	 */
	function NumericValue (initialValue) {
		AnyAtomicTypeValue.call(this, initialValue);
	}

	NumericValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
	NumericValue.prototype.constructor = NumericValue;

	NumericValue.cast = function (value) {
		var anyAtomicTypeValue = AnyAtomicTypeValue.cast(value);
		var floatValue = parseFloat(anyAtomicTypeValue.value, 10);

		return new NumericValue(floatValue);
	};

	NumericValue.prototype.getEffectiveBooleanValue = function () {
		return this.value !== 0 && !Number.isNaN(this.value);
	};

	NumericValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === 'xs:numeric' ||
			AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
	};

	return NumericValue;
});
