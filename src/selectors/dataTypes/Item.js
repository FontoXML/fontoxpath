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
* @return {string}
*/
Item.prototype.toString = function () {
	return `(item ${this.primitiveTypeName} ${this.value})`;
};

/**
 * @abstract
 * @param   {../DynamicContext}  _dynamicContext  Needed for atomizing some properties
 * @return  {!Item} Note: circular
 */
Item.prototype.atomize = function (_dynamicContext) {};

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
