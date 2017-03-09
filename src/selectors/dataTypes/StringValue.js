import AnyAtomicTypeValue from './AnyAtomicTypeValue';

/**
 * @constructor
 * @extends {AnyAtomicTypeValue<string>}
 * @param  {!string}  value
 */
function StringValue (value) {
    AnyAtomicTypeValue.call(this, value);
}

StringValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
StringValue.prototype.constructor = StringValue;

StringValue.prototype.getEffectiveBooleanValue = function () {
    return this.value.length > 0;
};

StringValue.primitiveTypeName = StringValue.prototype.primitiveTypeName = 'xs:string';

StringValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === this.primitiveTypeName ||
        AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
};

export default StringValue;
