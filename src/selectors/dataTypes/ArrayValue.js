define([
	'../functions/builtInFunctions.arrays.get',
	'./Sequence',
	'./FunctionItem'
], function (
	arrayGet,
	Sequence,
	FunctionItem
) {
	'use strict';

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

	return ArrayValue;
});
