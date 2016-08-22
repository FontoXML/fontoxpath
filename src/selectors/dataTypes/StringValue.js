define([
	'./AnyAtomicValue'
], function (
	AnyAtomicValue
) {
	'use strict';

	function StringValue (value) {
		AnyAtomicValue.call(this, value);
	}

	StringValue.prototype = Object.create(AnyAtomicValue.prototype);
	StringValue.prototype.constructor = StringValue;

	StringValue.cast = function (value) {
		return new StringValue(AnyAtomicValue.cast(value).value);
	};

	StringValue.prototype.getEffectiveBooleanValue = function () {
		return this.value.length > 0;
	};

	StringValue.primitiveTypeName = StringValue.prototype.primitiveTypeName = 'xs:string';

	StringValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === this.primitiveTypeName ||
			AnyAtomicValue.prototype.instanceOfType(simpleTypeName);
	};


	return StringValue;
});
