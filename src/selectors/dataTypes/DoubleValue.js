define([
	'./NumericValue'
], function (
	NumericValue
) {
	function DoubleValue (initialValue) {
		NumericValue.call(this, initialValue, 'xs:double');
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

	return DoubleValue;
});
