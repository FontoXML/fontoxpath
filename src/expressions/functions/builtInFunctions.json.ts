import ArrayValue from '../dataTypes/ArrayValue';
import createAtomicValue from '../dataTypes/createAtomicValue';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';

import ISequence from '../dataTypes/ISequence';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import FunctionDefinitionType from './FunctionDefinitionType';

function convert(obj: any): ISequence {
	switch (typeof obj) {
		case 'object':
			if (Array.isArray(obj)) {
				return sequenceFactory.singleton(
					new ArrayValue(
						obj.map(subObject => createDoublyIterableSequence(convert(subObject)))
					)
				);
			}
			if (obj === null) {
				return sequenceFactory.empty();
			}
			// Normal object
			return sequenceFactory.singleton(
				new MapValue(
					Object.keys(obj as Object).map(key => {
						return {
							key: createAtomicValue(key, 'xs:string'),
							value: createDoublyIterableSequence(convert((obj as Object)[key]))
						};
					})
				)
			);
		case 'number':
			return sequenceFactory.singleton(createAtomicValue(obj, 'xs:double'));
		case 'string':
			return sequenceFactory.singleton(createAtomicValue(obj, 'xs:string'));
		case 'boolean':
			return obj
				? sequenceFactory.singletonTrueSequence()
				: sequenceFactory.singletonFalseSequence();
		default:
			throw new Error('Unexpected type in JSON parse');
	}
}

const fnParseJson: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	jsonString
) {
	let jsObject: any;
	try {
		jsObject = JSON.parse(jsonString.first().value);
	} catch (_e) {
		throw new Error('FOJS0001: parsed JSON string contains illegal JSON.');
	}

	return convert(jsObject);
};

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
