import SequenceFactory from '../dataTypes/SequenceFactory';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ArrayValue from '../dataTypes/ArrayValue';
import MapValue from '../dataTypes/MapValue';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionDefinitionType from './FunctionDefinitionType';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

/**
 * @param  {*}  obj
 * @return {!ISequence}
 */
function convert (obj) {
	switch (typeof obj) {
		case 'object':
			if (Array.isArray(obj)) {
				return SequenceFactory.singleton(new ArrayValue(obj.map(subObject => createDoublyIterableSequence(convert(subObject)))));
			}
			if (obj === null) {
				return SequenceFactory.empty();
			}
			// Normal object
			return SequenceFactory.singleton(new MapValue(Object.keys(/** @type {!Object} */(obj)).map(key => {
				return {
					key: createAtomicValue(key, 'xs:string'),
					value: createDoublyIterableSequence(convert(/** @type {!Object} */(obj)[key]))
				};
			})));
		case 'number':
			return SequenceFactory.singleton(createAtomicValue(obj, 'xs:double'));
		case 'string':
			return SequenceFactory.singleton(createAtomicValue(obj, 'xs:string'));
		case 'boolean':
			return obj ? SequenceFactory.singletonTrueSequence() : SequenceFactory.singletonFalseSequence();;
		default:
			throw new Error('Unexpected type in JSON parse');
	}
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnParseJson (_dynamicContext, _executionParameters, _staticContext, jsonString) {
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
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'parse-json',
			argumentTypes: ['xs:string'],
			returnType: 'item()?',
			callFunction: fnParseJson
		}
	],
	functions: {
		parseJson: fnParseJson
	}
};
