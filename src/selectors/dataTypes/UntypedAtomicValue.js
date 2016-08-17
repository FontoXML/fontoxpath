define([
	'./AnyAtomicValue'
], function (
	AnyAtomicValue
) {
	'use strict';

	function UntypedAtomicValue (value) {
		AnyAtomicValue.call(this, value, 'xs:untypedAtomic');
	}

	UntypedAtomicValue.prototype = Object.create(AnyAtomicValue.prototype);
	UntypedAtomicValue.prototype.constructor = UntypedAtomicValue;

	UntypedAtomicValue.cast = function (value) {
		throw new Error('Not implemented');
	};

	UntypedAtomicValue.prototype.getEffectiveBooleanValue = function () {
		return this.value.length > 0;
	};

	return UntypedAtomicValue;
});
