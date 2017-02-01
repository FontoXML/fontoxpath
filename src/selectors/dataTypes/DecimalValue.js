import NumericValue from './NumericValue';
import AnyAtomicTypeValue from './AnyAtomicTypeValue';
/**
 * @constructor
 * @extends {NumericValue}
 * @param  {!number}  initialValue
 */
function DecimalValue (initialValue) {
    NumericValue.call(this, initialValue);
}

DecimalValue.prototype = Object.create(NumericValue.prototype);
DecimalValue.prototype.constructor = DecimalValue;

DecimalValue.cast = function (value) {
    if (value instanceof DecimalValue) {
        return new DecimalValue(value.value);
    }

    var anyAtomicTypeValue = AnyAtomicTypeValue.cast(value);
	var floatValue = parseFloat(anyAtomicTypeValue.value);
	if (Number.isNaN(floatValue)) {
        throw new Error('XPTY0004: can not cast ' + value + ' to xs:boolean');
	}
	return new DecimalValue(floatValue);
};

DecimalValue.primitiveTypeName = DecimalValue.prototype.primitiveTypeName = 'xs:decimal';

DecimalValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === this.primitiveTypeName ||
        NumericValue.prototype.instanceOfType.call(this, simpleTypeName);
};

export default DecimalValue;
