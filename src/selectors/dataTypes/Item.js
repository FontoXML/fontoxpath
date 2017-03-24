/**
 * @abstract
 * @constructor
 * @template T
 * @param  {T}  value
 */
function Item (value) {
    this.value = value;
}

Item.primitiveTypeName = Item.prototype.primitiveTypeName = 'item()';

/**
 * @abstract
 * @return  {!Item} Note: circular
 */
Item.prototype.atomize = function () {};

Item.prototype.getEffectiveBooleanValue = function () {
    throw new Error('Not implemented');
};

/**
 * @param   {string}  simpleTypeName
 * @return  {boolean}
 */
Item.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === 'item()';
};

export default Item;
