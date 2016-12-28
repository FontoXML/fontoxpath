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

BooleanValue.cast = function (value) {
    if (value instanceof BooleanValue) {
        return new BooleanValue(value.value);
    }

    var anyAtomicTypeValue = AnyAtomicTypeValue.cast(value);

    switch (anyAtomicTypeValue.value) {
        case 'true':
        case '1':
            return BooleanValue.TRUE;
        case 'false':
        case '0':
            return BooleanValue.FALSE;

        default:
            throw new Error('XPTY0004: can not cast ' + value + ' to xs:boolean');
    }
};

BooleanValue.prototype.getEffectiveBooleanValue = function () {
    return this.value;
};

BooleanValue.primitiveTypeName = BooleanValue.prototype.primitiveTypeName = 'xs:boolean';

BooleanValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === this.primitiveTypeName ||
        AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
};

export default BooleanValue;
