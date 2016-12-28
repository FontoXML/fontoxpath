import AnyAtomicTypeValue from './AnyAtomicTypeValue';

/**
 * @constructor
 * @extends {AnyAtomicTypeValue<string>}
 * @param  {!*}  value
 */
function UntypedAtomicValue (value) {
    AnyAtomicTypeValue.call(this, value + '');
}

UntypedAtomicValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
UntypedAtomicValue.prototype.constructor = UntypedAtomicValue;

UntypedAtomicValue.cast = function (value) {
    throw new Error('Not implemented');
};

UntypedAtomicValue.prototype.getEffectiveBooleanValue = function () {
    return this.value.length > 0;
};

UntypedAtomicValue.primitiveTypeName = UntypedAtomicValue.prototype.primitiveTypeName = 'xs:untypedAtomic';

UntypedAtomicValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === 'xs:untypedAtomic' ||
        AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
};

export default UntypedAtomicValue;
