import DecimalValue from './DecimalValue';

/**
 * @constructor
 * @extends {DecimalValue}
 * @param  {!number}  initialValue
 */
function IntegerValue (initialValue) {
    DecimalValue.call(this, Math.floor(initialValue));
}

IntegerValue.prototype = Object.create(DecimalValue.prototype);
IntegerValue.prototype.constructor = IntegerValue;

IntegerValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === 'xs:integer' ||
        DecimalValue.prototype.instanceOfType.call(this, simpleTypeName);
};

export default IntegerValue;
