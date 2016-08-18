define([
	'./AnyAtomicValue'
], function (
	AnyAtomicValue
) {
	function FloatValue (initialValue) {
		AnyAtomicValue.call(this, initialValue, 'xs:float');
	}

	FloatValue.prototype = Object.create(AnyAtomicValue.prototype);
	FloatValue.prototype.constructor = FloatValue;

	FloatValue.cast = function (value) {
		if (value instanceof FloatValue) {
			return new FloatValue(value.value);
		}

		// In JavaScript, doubles are the same as decimals
		var decimalValue = AnyAtomicValue.cast(value);
		return new FloatValue(parseFloat(decimalValue.value, 10));
	};

	return FloatValue;
});
