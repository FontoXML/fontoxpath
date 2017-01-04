import NumericValue from './NumericValue';
import AnyAtomicTypeValue from './AnyAtomicTypeValue';

/**
 * @constructor
 * @extends {NumericValue}
 * @param  {!number}  initialValue
 */
function DoubleValue (initialValue) {
    NumericValue.call(this, initialValue);
}

DoubleValue.prototype = Object.create(NumericValue.prototype);
DoubleValue.prototype.constructor = DoubleValue;

DoubleValue.cast = function (value) {
    if (value instanceof DoubleValue) {
        return new DoubleValue(value.value);
    }

    var anyAtomicTypeValue = AnyAtomicTypeValue.cast(value);
	var floatValue = parseFloat(anyAtomicTypeValue.value);

    return new DoubleValue(floatValue);
};

DoubleValue.primitiveTypeName = DoubleValue.prototype.primitiveTypeName = 'xs:double';

DoubleValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === this.primitiveTypeName ||
        NumericValue.prototype.instanceOfType.call(this, simpleTypeName);
};

export default DoubleValue;
