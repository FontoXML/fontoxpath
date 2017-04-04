import Item from './Item';
import NodeValue from './NodeValue';

/**
 * @constructor
 * @extends {Item<Array<Item<?>>>}
 * @param  {?Array<*>=}  initialValues
 */
function Sequence (initialValues) {
    Item.call(this, initialValues || []);
}

Sequence.prototype = Object.create(Item.prototype);

/**
 * @param   {!Item}  value
 * @return  {!Sequence}
 */
Sequence.singleton = function (value) {
    return new Sequence([value]);
};

/**
 * @return  {!Sequence}
 */
Sequence.empty = function () {
    return new Sequence([]);
};

/**
 * @param  {!../DynamicContext.default} dynamicContext
 * @return {!Sequence}
 */
Sequence.prototype.atomize = function (dynamicContext) {
    return new Sequence(this.value.map(function (value) {
        return value.atomize(dynamicContext);
    }));
};

Sequence.prototype.isEmpty = function () {
    return this.value.length === 0;
};

Sequence.prototype.isSingleton = function () {
    return this.value.length === 1;
};

Sequence.prototype.instanceOfType = function (type) {
	return !!this.value.length && this.value.every(function (valueItem) {
		return valueItem.instanceOfType(type);
	});
};

Sequence.prototype.getEffectiveBooleanValue = function () {
    if (this.isEmpty()) {
        return false;
    }

    if (this.value[0] instanceof NodeValue) {
        return true;
    }

    if (this.isSingleton()) {
        return this.value[0].getEffectiveBooleanValue();
    }

    throw new Error('FORG0006: A wrong argument type was specified in a function call.');
};

Sequence.prototype.merge = function (otherSequence) {
    this.value = this.value.concat(otherSequence.value);
    return this;
};

export default Sequence;
