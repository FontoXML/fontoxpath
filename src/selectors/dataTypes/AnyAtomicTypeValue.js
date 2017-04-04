import Item from './Item';

/**
 * @constructor
 * @extends {Item<T>}
 * @template T
 * @param  {!(string|number|boolean)}  value
 */
function AnyAtomicTypeValue (value) {
    Item.call(this, value);
}

AnyAtomicTypeValue.prototype = Object.create(Item.prototype);
AnyAtomicTypeValue.prototype.constructor = AnyAtomicTypeValue;

AnyAtomicTypeValue.prototype.atomize = function (_dynamicContext) {
    return this;
};

AnyAtomicTypeValue.primitiveTypeName = AnyAtomicTypeValue.prototype.primitiveTypeName = 'xs:anyAtomicType';

AnyAtomicTypeValue.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === 'xs:anyAtomicType' ||
        Item.prototype.instanceOfType.call(this, simpleTypeName);
};

export default AnyAtomicTypeValue;
