import AnyAtomicTypeValue from './AnyAtomicTypeValue';

/**
 * Abstract Numeric class, union type for everything which is numeric: decimal (and integer), double and float
 * @constructor
 * @abstract
 * @extends {AnyAtomicTypeValue<number>}
 * @param  {number}  initialValue
 */
function NumericValue (initialValue) {
    AnyAtomicTypeValue.call(this, initialValue);
}

NumericValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
NumericValue.prototype.constructor = NumericValue;

NumericValue.prototype.getEffectiveBooleanValue = function () {
    return this.value !== 0 && !Number.isNaN(this.value);
};

NumericValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === 'xs:numeric' ||
        AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
};

NumericValue.prototype.isNaN = function () {
	return isNaN(this.value);
};

export default NumericValue;
