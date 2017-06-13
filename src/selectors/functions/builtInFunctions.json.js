import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ArrayValue from '../dataTypes/ArrayValue';
import MapValue from '../dataTypes/MapValue';

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
					key: createAtomicValue(key, 'xs:string'),
					value: convert(/** @type {!Object} */(obj)[key])
				};
			})));
		case 'number':
			return Sequence.singleton(createAtomicValue(obj, 'xs:double'));
		case 'string':
			return Sequence.singleton(createAtomicValue(obj, 'xs:string'));
		case 'boolean':
			return obj ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();;
		default:
			throw new Error('Unexpected type in JSON parse');
	}
}

function fnParseJson (_dynamicContext, jsonString) {
	/** @type {?} */
	let jsObject;
	try {
		jsObject = JSON.parse(jsonString.first().value);
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
