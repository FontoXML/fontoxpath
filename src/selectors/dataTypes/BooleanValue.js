define([
	'./AnyAtomicValue'
], function (
	AnyAtomicValue
) {
	function BooleanValue (initialValue) {
		AnyAtomicValue.call(this, initialValue);
	}

	BooleanValue.prototype = Object.create(AnyAtomicValue.prototype);
	BooleanValue.prototype.constructor = BooleanValue;

	BooleanValue.cast = function (value) {
		if (value instanceof BooleanValue) {
			return new BooleanValue(value.value);
		}

		var anyAtomicValue = AnyAtomicValue.cast(value);

		var booleanValue;

		switch (anyAtomicValue.value) {
			case 'true':
				booleanValue = true;
				break;
			case 'false':
				booleanValue = false;
				break;
			case '0':
				booleanValue = false;
				break;
			case '1':
				booleanValue = true;
				break;
			default:
				throw new Error('XPTY0004: can not cast ' + value + ' to xs:boolean');
		}

		return new BooleanValue(booleanValue);
	};

	BooleanValue.prototype.getEffectiveBooleanValue = function () {
		return this.value;
	};

	BooleanValue.primitiveTypeName = BooleanValue.prototype.primitiveTypeName = 'xs:boolean';

	BooleanValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === this.primitiveTypeName ||
			AnyAtomicValue.prototype.instanceOfType(simpleTypeName);
	};


	return BooleanValue;
});
