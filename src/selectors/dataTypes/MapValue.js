define([
	'../functions/builtInFunctions.maps.get',
	'./Sequence',
	'./FunctionItem'
], function (
	mapGet,
	Sequence,
	FunctionItem
) {
	'use strict';

	function MapValue (keyValuePairs) {
		FunctionItem.call(this, function (dynamicContext, key) {
			return mapGet(dynamicContext, Sequence.singleton(this), key);
		}.bind(this), ['xs:anyAtomicType'], 1, 'item()*');
		this.keyValuePairs = keyValuePairs;
	}

	MapValue.prototype = Object.create(FunctionItem.prototype);
	MapValue.prototype.constructor = MapValue;
	MapValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === 'map(*)' ||
			FunctionItem.prototype.instanceOfType.call(this, simpleTypeName);
	};

	return MapValue;
});
