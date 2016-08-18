define([
	'./NumericValue'
], function (
	NumericValue
) {
	function DecimalValue (initialValue) {
		NumericValue.call(this, initialValue, 'xs:decimal');
	}

	DecimalValue.prototype = Object.create(NumericValue.prototype);
	DecimalValue.prototype.constructor = DecimalValue;

	DecimalValue.cast = function (value) {
		if (value instanceof DecimalValue) {
			return new DecimalValue(value.value);
		}

		var numericValue = NumericValue.cast(value);
		return new DecimalValue(numericValue.value);
	};

	DecimalValue.prototype.getEffectiveBooleanValue = function () {
		return this.value !== 0 && !Number.isNaN(this.value);
	};

	return DecimalValue;
});
