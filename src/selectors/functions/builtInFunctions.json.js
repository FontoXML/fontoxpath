import ArrayValue from '../dataTypes/ArrayValue';
import MapValue from '../dataTypes/MapValue';
import StringValue from '../dataTypes/StringValue';
import BooleanValue from '../dataTypes/BooleanValue';
import DoubleValue from '../dataTypes/DoubleValue';
import Sequence from '../dataTypes/Sequence';

/**
 * @param  {*}  obj
 * @return {Sequence}
 */
function convert (obj) {
	switch (typeof obj) {
		case 'object':
			if (Array.isArray(obj)) {
				return Sequence.singleton(new ArrayValue(obj.map(subObject => convert(subObject))));
			}
			if (obj === null) {
				return Sequence.empty();
			}
			// Normal object
			return Sequence.singleton(new MapValue(Object.keys(/** @type {!Object} */(obj)).map(key => {
				return {
					key: new StringValue(key),
					value: convert(/** @type {!Object} */(obj)[key])
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
}

function fnParseJson (_dynamicContext, jsonString) {
	/** @type {?} */
	let jsObject;
	try {
		jsObject = JSON.parse(jsonString.value[0].value);
	}
	catch (_e) {
		throw new Error('FOJS0001: parsed JSON string contains illegal JSON.');
	}

	return convert(jsObject);
}

export default {
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
