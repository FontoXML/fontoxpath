import ArrayValue from '../dataTypes/ArrayValue';
import { BaseType } from '../dataTypes/BaseType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity } from '../dataTypes/Value';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

function convert(obj: any): ISequence {
	switch (typeof obj) {
		case 'object':
			if (Array.isArray(obj)) {
				return sequenceFactory.singleton(
					new ArrayValue(
						obj.map((subObject) => createDoublyIterableSequence(convert(subObject)))
					)
				);
			}
			if (obj === null) {
				return sequenceFactory.empty();
			}
			// Normal object
			return sequenceFactory.singleton(
				new MapValue(
					Object.keys(obj as object).map((key) => {
						return {
							key: createAtomicValue(key, {
								kind: BaseType.XSSTRING,
								seqType: SequenceMultiplicity.EXACTLY_ONE,
							}),
							value: createDoublyIterableSequence(convert((obj as object)[key])),
						};
					})
				)
			);
		case 'number':
			return sequenceFactory.singleton(
				createAtomicValue(obj, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceMultiplicity.EXACTLY_ONE,
				})
			);
		case 'string':
			return sequenceFactory.singleton(
				createAtomicValue(obj, {
					kind: BaseType.XSSTRING,
					seqType: SequenceMultiplicity.EXACTLY_ONE,
				})
			);
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
	jsonString
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
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'parse-json',
		argumentTypes: [{ kind: BaseType.XSSTRING, seqType: SequenceMultiplicity.EXACTLY_ONE }],
		returnType: { kind: BaseType.ITEM, seqType: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnParseJson,
	},
];

export default {
	declarations,
	functions: {
		parseJson: fnParseJson,
	},
};
