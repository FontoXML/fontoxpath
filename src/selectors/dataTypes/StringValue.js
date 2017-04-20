import AnyAtomicTypeValue from './AnyAtomicTypeValue';


const stringValueByString = Object.create(null);
/**
 * @constructor
 * @extends {AnyAtomicTypeValue<string>}
 * @param  {!string}  value
 */
function StringValue (value) {
	if (value.length < 100) {
		if (stringValueByString[value]) {
			return stringValueByString[value];
		}
	}
    AnyAtomicTypeValue.call(this, value);
	stringValueByString[value] = this;
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
