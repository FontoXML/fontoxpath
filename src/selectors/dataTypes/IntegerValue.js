import DecimalValue from './DecimalValue';

const instantiatedIntegerValueByValue = Object.create(null);

/**
 * @constructor
 * @extends {DecimalValue}
 * @param  {!number}  initialValue
 */
function IntegerValue (initialValue) {
	if (instantiatedIntegerValueByValue[initialValue]) {
		return instantiatedIntegerValueByValue[initialValue];
	}
    DecimalValue.call(this, Math.floor(initialValue));
	if (initialValue < 1000) {
		instantiatedIntegerValueByValue[initialValue] = this;
	}
	return this;
}

IntegerValue.prototype = Object.create(DecimalValue.prototype);
IntegerValue.prototype.constructor = IntegerValue;

IntegerValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === 'xs:integer' ||
        DecimalValue.prototype.instanceOfType.call(this, simpleTypeName);
};

export default IntegerValue;
