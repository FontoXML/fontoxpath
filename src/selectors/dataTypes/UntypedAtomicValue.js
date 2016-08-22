define([
	'./AnyAtomicValue'
], function (
	AnyAtomicValue
) {
	'use strict';

	function UntypedAtomicValue (value) {
		AnyAtomicValue.call(this, value);
	}

	UntypedAtomicValue.prototype = Object.create(AnyAtomicValue.prototype);
	UntypedAtomicValue.prototype.constructor = UntypedAtomicValue;

	UntypedAtomicValue.cast = function (value) {
		throw new Error('Not implemented');
	};

	UntypedAtomicValue.prototype.getEffectiveBooleanValue = function () {
		return this.value.length > 0;
	};

	UntypedAtomicValue.primitiveTypeName = UntypedAtomicValue.prototype.primitiveTypeName = 'xs:untypedAtomic';

	UntypedAtomicValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === 'xs:untypedAtomic' ||
			AnyAtomicValue.prototype.instanceOfType(simpleTypeName);
	};

	return UntypedAtomicValue;
});
