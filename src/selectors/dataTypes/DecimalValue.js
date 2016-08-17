define([
	'./AnyAtomicValue'
], function (
	AnyAtomicValue
) {
	function DecimalValue (initialValue) {
		AnyAtomicValue.call(this, initialValue, 'xs:decimal');
	}

	DecimalValue.prototype = Object.create(AnyAtomicValue.prototype);
	DecimalValue.prototype.constructor = DecimalValue;

	DecimalValue.cast = function (value) {
		if (value instanceof DecimalValue) {
			return new DecimalValue(value.value);
		}

		var anyAtomicValue = AnyAtomicValue.cast(value);
		var floatValue = parseFloat(anyAtomicValue.value, 10);

		if (Number.isNaN(floatValue)) {
			throw new Error('Can not cast ' + anyAtomicValue.value + ' to xs:decimal');
		}
		return new DecimalValue(floatValue);
	};

	DecimalValue.prototype.getEffectiveBooleanValue = function () {
		return this.value !== 0 && !Number.isNaN(this.value);
	};

	return DecimalValue;
});
