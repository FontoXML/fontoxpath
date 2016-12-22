define([
	'../dataTypes/ArrayValue',
	'../dataTypes/MapValue',
	'../dataTypes/StringValue',
	'../dataTypes/BooleanValue',
	'../dataTypes/DoubleValue',
	'../dataTypes/Sequence'
], function (
	ArrayValue,
	MapValue,
	StringValue,
	BooleanValue,
	DoubleValue,
	Sequence
) {
	'use strict';

	function fnParseJson (_dynamicContext, jsonString) {
		var jsObject;
		try {
			jsObject = JSON.parse(jsonString.value[0].value);
		}
		catch (_e) {
			throw new Error('FOJS0001: parsed JSON string contains illegal JSON.');
		}

		return (function convert (obj) {
			switch (typeof obj) {
				case 'object':
					if (Array.isArray(obj)) {
						return Sequence.singleton(new ArrayValue(obj.map(convert)));
					}
					if (obj === null) {
						return Sequence.empty();
					}
					// Normal object
					return Sequence.singleton(new MapValue(Object.keys(obj).map(function (key) {
						return {
							key: new StringValue(key),
							value: convert(obj[key])
						};
					})));
				case 'number':
					return Sequence.singleton(new DoubleValue(obj));
				case 'string':
					return Sequence.singleton(new StringValue(obj));
				case 'boolean':
					return Sequence.singleton(new BooleanValue(obj));
				default:
					throw new Error('Unexpected type in JSON parse');
			}
		})(jsObject);
	}

	return {
		declarations: [
			{
				name: 'parse-json',
				argumentTypes: ['xs:string'],
				returnType: 'item()?',
				callFunction: fnParseJson
			}
		],
		functions: {
			parseJson: fnParseJson
		}
	};
});
