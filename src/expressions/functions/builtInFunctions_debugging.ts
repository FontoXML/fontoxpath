import atomize from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnTrace: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	arg,
	label
) => {
	return arg.mapAll((allItems) => {
		const argumentAsStrings = atomize(sequenceFactory.create(allItems), executionParameters)
			.map((value) => castToType(value, ValueType.XSSTRING))
			.getAllValues();

		let newMessage = '';
		for (let i = 0; i < argumentAsStrings.length; i++) {
			newMessage +=
				'{type: ' +
				argumentAsStrings[i].type +
				', value: ' +
				argumentAsStrings[i].value +
				'}\n';
		}
		if (label !== undefined) {
			newMessage += label.first().value;
		}
		executionParameters.logger.trace(newMessage);

		return sequenceFactory.create(allItems);
	});
};

const declarations: BuiltinDeclarationType[] = [
	{
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnTrace,
		localName: 'trace',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},
	{
		argumentTypes: [
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction: fnTrace,
		localName: 'trace',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},
];

export default {
	declarations,
};
