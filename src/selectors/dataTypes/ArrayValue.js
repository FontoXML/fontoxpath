import arrayGet from '../functions/builtInFunctions.arrays.get';
import Sequence from './Sequence';
import FunctionItem from './FunctionItem';

/**
 * @constructor
 * @extends {FunctionItem}
 * @param   {!Array<!Sequence>}  members
 */
function ArrayValue (members) {
	FunctionItem.call(this, function (dynamicContext, key) {
		return arrayGet(dynamicContext, Sequence.singleton(this), key);
	}.bind(this), ['xs:integer'], 1, 'item()*');
	this.members = members;
}

ArrayValue.prototype = Object.create(FunctionItem.prototype);
ArrayValue.prototype.constructor = ArrayValue;

ArrayValue.prototype.instanceOfType = function (simpleTypeName) {
	return simpleTypeName === 'array(*)' ||
		FunctionItem.prototype.instanceOfType.call(this, simpleTypeName);
};

export default ArrayValue;
