import NumericValue from './NumericValue';

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
    var decimalValue = NumericValue.cast(value);
    return new FloatValue(parseFloat(decimalValue.value));
};

FloatValue.primitiveTypeName = FloatValue.prototype.primitiveTypeName = 'xs:float';

FloatValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === this.primitiveTypeName ||
        NumericValue.prototype.instanceOfType.call(this, simpleTypeName);
};


export default FloatValue;
