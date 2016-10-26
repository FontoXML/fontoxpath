define([
	'./AnyAtomicTypeValue'
], function (
	AnyAtomicTypeValue
) {
	'use strict';

	function StringValue (value) {
		AnyAtomicTypeValue.call(this, value);
	}

	StringValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
	StringValue.prototype.constructor = StringValue;

	StringValue.cast = function (value) {
		return new StringValue(AnyAtomicTypeValue.cast(value).value);
	};

	StringValue.prototype.getEffectiveBooleanValue = function () {
		return this.value.length > 0;
	};

	StringValue.primitiveTypeName = StringValue.prototype.primitiveTypeName = 'xs:string';

	StringValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === this.primitiveTypeName ||
			AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
	};

	return StringValue;
});
