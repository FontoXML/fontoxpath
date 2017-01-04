import NumericValue from './NumericValue';
import AnyAtomicTypeValue from './AnyAtomicTypeValue';

/**
 * @constructor
 * @extends {NumericValue}
 * @param  {!number}  initialValue
 */
function FloatValue (initialValue) {
    NumericValue.call(this, initialValue);
}

FloatValue.prototype = Object.create(NumericValue.prototype);
FloatValue.prototype.constructor = FloatValue;

FloatValue.cast = function (value) {
    if (value instanceof FloatValue) {
        return new FloatValue(value.value);
    }

    // In JavaScript, doubles are the same as decimals
    var anyAtomicTypeValue = AnyAtomicTypeValue.cast(value);
	var floatValue = parseFloat(anyAtomicTypeValue.value);

	return new FloatValue(floatValue);
};

FloatValue.primitiveTypeName = FloatValue.prototype.primitiveTypeName = 'xs:float';

FloatValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === this.primitiveTypeName ||
        NumericValue.prototype.instanceOfType.call(this, simpleTypeName);
};


export default FloatValue;
