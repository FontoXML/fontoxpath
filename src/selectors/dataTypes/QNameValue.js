import AnyAtomicTypeValue from './AnyAtomicTypeValue';

/**
 * @constructor
 * @extends {AnyAtomicTypeValue<string>}
 * @param  {!string}  value
 */
function QNameValue (value) {
    AnyAtomicTypeValue.call(this, value);
}

QNameValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
QNameValue.prototype.constructor = QNameValue;

QNameValue.prototype.getEffectiveBooleanValue = function () {
    return this.value.length > 0;
};

QNameValue.primitiveTypeName = QNameValue.prototype.primitiveTypeName = 'xs:QName';

QNameValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === this.primitiveTypeName ||
        AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
};

export default QNameValue;
