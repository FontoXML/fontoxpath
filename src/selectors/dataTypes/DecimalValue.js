import NumericValue from './NumericValue';

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

    var numericValue = NumericValue.cast(value);
    return new DecimalValue(numericValue.value);
};

DecimalValue.primitiveTypeName = DecimalValue.prototype.primitiveTypeName = 'xs:decimal';

DecimalValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === this.primitiveTypeName ||
        NumericValue.prototype.instanceOfType.call(this, simpleTypeName);
};

export default DecimalValue;
