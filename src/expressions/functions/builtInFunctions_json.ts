import ArrayValue from '../dataTypes/ArrayValue';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

function convert(obj: any): ISequence {
	switch (typeof obj) {
		case 'object':
			if (Array.isArray(obj)) {
				return sequenceFactory.singleton(
					new ArrayValue(
						obj.map((subObject) => createDoublyIterableSequence(convert(subObject))),
					),
				);
			}
			if (obj === null) {
				return sequenceFactory.empty();
			}
			const objThingy = obj as { [key: string]: any };
			// Normal object
			return sequenceFactory.singleton(
				new MapValue(
					Object.keys(objThingy).map((key) => {
						return {
							key: createAtomicValue(key, ValueType.XSSTRING),
							value: createDoublyIterableSequence(convert(objThingy[key])),
						};
					}),
				),
			);
		case 'number':
			return sequenceFactory.singleton(createAtomicValue(obj, ValueType.XSDOUBLE));
		case 'string':
			return sequenceFactory.singleton(createAtomicValue(obj, ValueType.XSSTRING));
		case 'boolean':
			return obj
				? sequenceFactory.singletonTrueSequence()
				: sequenceFactory.singletonFalseSequence();
		default:
			throw new Error('Unexpected type in JSON parse');
	}
}

const fnParseJson: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	jsonString,
) => {
	let jsObject: any;
	try {
		jsObject = JSON.parse(jsonString.first().value);
	} catch (_e) {
		throw new Error('FOJS0001: parsed JSON string contains illegal JSON.');
	}

	return convert(jsObject);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'parse-json',
		argumentTypes: [{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE }],
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnParseJson,
	},
];

export default {
	declarations,
	functions: {
		parseJson: fnParseJson,
	},
};
