define([
	'./AnyAtomicTypeValue'
], function (
	AnyAtomicTypeValue
) {
	'use strict';

	function QNameValue (value) {
		AnyAtomicTypeValue.call(this, value);
	}

	QNameValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
	QNameValue.prototype.constructor = QNameValue;

	QNameValue.cast = function (value) {
		return new QNameValue(AnyAtomicTypeValue.cast(value).value);
	};

	QNameValue.prototype.getEffectiveBooleanValue = function () {
		return this.value.length > 0;
	};

	QNameValue.primitiveTypeName = QNameValue.prototype.primitiveTypeName = 'xs:QName';

	QNameValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === this.primitiveTypeName ||
			AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
	};

	return QNameValue;
});
