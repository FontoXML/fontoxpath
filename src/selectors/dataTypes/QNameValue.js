define([
	'./AnyAtomicValue'
], function (
	AnyAtomicValue
) {
	'use strict';

	function QNameValue (value) {
		AnyAtomicValue.call(this, value);
	}

	QNameValue.prototype = Object.create(AnyAtomicValue.prototype);
	QNameValue.prototype.constructor = QNameValue;

	QNameValue.cast = function (value) {
		return new QNameValue(AnyAtomicValue.cast(value).value);
	};

	QNameValue.prototype.getEffectiveBooleanValue = function () {
		return this.value.length > 0;
	};

	QNameValue.primitiveTypeName = QNameValue.prototype.primitiveTypeName = 'xs:QName';

	QNameValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === this.primitiveTypeName ||
			AnyAtomicValue.prototype.instanceOfType(simpleTypeName);
	};

	return QNameValue;
});
