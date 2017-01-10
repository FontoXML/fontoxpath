import Item from './Item';
import Sequence from './Sequence';
import DynamicContext from '../DynamicContext';

function expandRestArgumentToArity (argumentTypes, arity) {
	var indexOfRest = argumentTypes.indexOf('...');
	if (indexOfRest > -1) {
		var replacePart = new Array(arity - (argumentTypes.length - 1))
			.fill(argumentTypes[indexOfRest - 1]);

		return argumentTypes.slice(0, indexOfRest)
			.concat(replacePart);
	}
	return argumentTypes;
}

/**
 * @constructor
 * @extends {Item}
 * @param  {!function(!DynamicContext, !Sequence): !Sequence}  value
 * @param  {!Array<string>}                                     argumentTypes
 * @param  {!number}                                            arity
 * @param  {!string}                                            returnType
 */
function FunctionItem (value, argumentTypes, arity, returnType) {
    Item.call(this, value);

	this._argumentTypes = expandRestArgumentToArity(argumentTypes, arity);
    this._arity = arity;
    this._returnType = returnType;
}

FunctionItem.prototype = Object.create(Item.prototype);
FunctionItem.prototype.constructor = FunctionItem;

/**
 * Apply these arguments to curry them into a new function
 * @param   {!Array<?Sequence>}  appliedArguments
 * @return  {!Sequence}
 */
FunctionItem.prototype.applyArguments = function (appliedArguments) {
	var fn = this.value;
	// fn (dynamicContext, ...arg)
	function curriedFunction (dynamicContext) {
		var newArguments = Array.from(arguments).slice(1);
		var allArguments = appliedArguments.map(function (argument) {
				// If argument === null, it is a placeholder, so use a provided one
				return argument || newArguments.shift();
			});
		return fn.apply(undefined, [dynamicContext].concat(allArguments));
	}
	var argumentTypes = appliedArguments.reduce(function (indices, arg, index) {
			if (arg === null) {
				indices.push(this._argumentTypes[index]);
			}
			return indices;
		}.bind(this), []);

	var functionItem = new FunctionItem(
			curriedFunction,
			argumentTypes,
			argumentTypes.length,
			this._returnType);

	return Sequence.singleton(functionItem);
};

FunctionItem.prototype.atomize = function () {
    throw new Error('FOTY0013: Not supported on this type');
};

FunctionItem.prototype.getEffectiveBooleanValue = function () {
    throw new Error('FORG0006: Not supported on this type');
};

FunctionItem.prototype.instanceOfType = function (simpleTypeName) {
    return simpleTypeName === 'function(*)' ||
        Item.prototype.instanceOfType.call(this, simpleTypeName);
};

FunctionItem.prototype.getArgumentTypes = function () {
    return this._argumentTypes;
};

FunctionItem.prototype.getReturnType = function () {
    return this._returnType;
};

FunctionItem.prototype.getArity = function () {
    return this._arity;
};

export default FunctionItem;
