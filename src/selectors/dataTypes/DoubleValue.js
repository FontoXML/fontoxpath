import NumericValue from './NumericValue';

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

DoubleValue.primitiveTypeName = DoubleValue.prototype.primitiveTypeName = 'xs:double';

DoubleValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === this.primitiveTypeName ||
        NumericValue.prototype.instanceOfType.call(this, simpleTypeName);
};

export default DoubleValue;
