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

DecimalValue.primitiveTypeName = DecimalValue.prototype.primitiveTypeName = 'xs:decimal';

DecimalValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === this.primitiveTypeName ||
        NumericValue.prototype.instanceOfType.call(this, simpleTypeName);
};

export default DecimalValue;
