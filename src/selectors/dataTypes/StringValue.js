define([
	'./AnyAtomicValue'
], function (
	AnyAtomicValue
) {
	'use strict';

	function StringValue (value) {
		AnyAtomicValue.call(this, value, 'xs:string');
	}

	StringValue.prototype = Object.create(AnyAtomicValue.prototype);
	StringValue.prototype.constructor = StringValue;

	StringValue.cast = function (value) {
		return new StringValue(AnyAtomicValue.cast(value).value);
	};

	StringValue.prototype.getEffectiveBooleanValue = function () {
		return this.value.length > 0;
	};

	return StringValue;
});
