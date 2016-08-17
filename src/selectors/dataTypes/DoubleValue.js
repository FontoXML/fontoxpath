define([
	'./AnyAtomicValue'
], function (
	AnyAtomicValue
) {
	function DoubleValue (initialValue) {
		AnyAtomicValue.call(this, initialValue, 'xs:double');
	}

	DoubleValue.prototype = Object.create(AnyAtomicValue.prototype);
	DoubleValue.prototype.constructor = DoubleValue;

	DoubleValue.cast = function (value) {
		if (value instanceof DoubleValue) {
			return new DoubleValue(value.value);
		}

		// In JavaScript, doubles are the same as decimals
		var decimalValue = AnyAtomicValue.cast(value);
		return new DoubleValue(parseFloat(decimalValue.value, 10));
	};

	return DoubleValue;
});
