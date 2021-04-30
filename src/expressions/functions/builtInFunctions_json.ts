import ArrayValue from '../dataTypes/ArrayValue';
import createAtomicValue from '../dataTypes/createAtomicValue';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';

import ISequence from '../dataTypes/ISequence';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import FunctionDefinitionType from './FunctionDefinitionType';
import { BaseType } from '../dataTypes/Value';
import { BuiltinDeclarationType } from './builtInFunctions';

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
							key: createAtomicValue(key, { kind: BaseType.XSSTRING }),
							value: createDoublyIterableSequence(convert((obj as object)[key])),
						};
					})
				)
			);
		case 'number':
			return sequenceFactory.singleton(createAtomicValue(obj, { kind: BaseType.XSDOUBLE }));
		case 'string':
			return sequenceFactory.singleton(createAtomicValue(obj, { kind: BaseType.XSSTRING }));
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
		argumentTypes: [{ kind: BaseType.XSSTRING }],
		returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.ITEM } },
		callFunction: fnParseJson,
	},
];

export default {
	declarations,
	functions: {
		parseJson: fnParseJson,
	},
};
