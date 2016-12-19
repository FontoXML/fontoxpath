define([
	'./Sequence',
	'./FunctionItem'
], function (
	Sequence,
	FunctionItem
) {
	'use strict';

	function isSameKey (k1, k2) {
		var k1IsStringLike = k1.instanceOfType('xs:string') || k1.instanceOfType('xs:anyURI') || k1.instanceOfType('xs:untypedAtomic');
		var k2IsStringLike = k2.instanceOfType('xs:string') || k2.instanceOfType('xs:anyURI') || k2.instanceOfType('xs:untypedAtomic');

		if (k1IsStringLike && k2IsStringLike) {
			// fn:codepoint-equal is ===
			return k1.value === k2.value;
		}

		var k1IsNumeric = k1.instanceOfType('xs:decimal') || k1.instanceOfType('xs:double') || k1.instanceOfType('xs:float');
		var k2IsNumeric = k2.instanceOfType('xs:decimal') || k2.instanceOfType('xs:double') || k2.instanceOfType('xs:float');
		if (k1IsNumeric && k2IsNumeric) {
			if (k1.isNaN() && k2.isNaN()) {
				return true;
			}
			return k1.value === k2.value;
		}
		// TODO: dateTime

		var k1IsOther = k1.instanceOfType('xs:boolean') || k1.instanceOfType('xs:hexBinary') || k1.instanceOfType('xs:duration') || k1.instanceOfType('xs:QName') || k1.instanceOfType('xs:NOTATION');
		var k2IsOther = k2.instanceOfType('xs:boolean') || k2.instanceOfType('xs:hexBinary') || k2.instanceOfType('xs:duration') || k2.instanceOfType('xs:QName') || k2.instanceOfType('xs:NOTATION');
		return k1IsOther && k2IsOther && k1.value === k2.value;
	}

	function MapValue (keyValuePairs) {
		FunctionItem.call(this.getValue.bind(this), ['xs:anyAtomicType'], 1, 'item()*');
		this._keyValuePairs = keyValuePairs;
	}

	MapValue.prototype = Object.create(FunctionItem.prototype);
	MapValue.prototype.constructor = MapValue;

	MapValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === 'map(*)' ||
			FunctionItem.prototype.instanceOfType.call(this, simpleTypeName);
	};

	MapValue.prototype.get = function (key) {
		var value = this._keyValuePairs.find(function (keyValuePair) {
				return isSameKey(keyValuePair.value[0], key);
			});

		if (!value) {
			return Sequence.empty();
		}
		return Sequence.singleton(value);
	};

	return MapValue;
});
