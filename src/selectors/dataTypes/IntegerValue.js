define([
	'./DecimalValue'
], function (
	DecimalValue
) {
	function IntegerValue (initialValue) {
		DecimalValue.call(this, initialValue);
	}

	IntegerValue.prototype = Object.create(DecimalValue.prototype);
	IntegerValue.prototype.constructor = IntegerValue;

	IntegerValue.cast = function (value) {
		if (value instanceof IntegerValue) {
			return new IntegerValue(value.value);
		}

		var decimalValue = DecimalValue.cast(value);

		// Strip off any decimals
		var integerValue = decimalValue.value % 1;

		return new IntegerValue(integerValue);
	};

	return IntegerValue;
});
