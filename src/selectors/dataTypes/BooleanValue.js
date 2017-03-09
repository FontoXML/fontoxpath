import AnyAtomicTypeValue from './AnyAtomicTypeValue';

/**
 * @constructor
 * @extends {AnyAtomicTypeValue<boolean>}
 * @param  {!boolean}  initialValue
 */
function BooleanValue (initialValue) {
    AnyAtomicTypeValue.call(this, initialValue);
}

BooleanValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
BooleanValue.prototype.constructor = BooleanValue;

BooleanValue.TRUE = BooleanValue.prototype.TRUE = new BooleanValue(true);
BooleanValue.FALSE = BooleanValue.prototype.FALSE = new BooleanValue(false);

BooleanValue.prototype.getEffectiveBooleanValue = function () {
    return this.value;
};

BooleanValue.primitiveTypeName = BooleanValue.prototype.primitiveTypeName = 'xs:boolean';

BooleanValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === this.primitiveTypeName ||
        AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
};

export default BooleanValue;
