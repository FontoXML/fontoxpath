import { NodePointer } from '../../domClone/Pointer';
import realizeDom from '../../domClone/realizeDom';
import atomize from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType, valueTypeToString } from '../dataTypes/Value';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnTrace: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	arg,
	label,
) => {
	return arg.mapAll((allItems) => {
		let newMessage = '';
		for (let i = 0; i < allItems.length; i++) {
			const value = allItems[i];
			const argumentAsString =
				executionParameters.xmlSerializer && isSubtypeOf(value.type, ValueType.NODE)
					? executionParameters.xmlSerializer.serializeToString(
							realizeDom(
								value.value as NodePointer,
								executionParameters,
								false,
							) as Node,
					  )
					: atomize(sequenceFactory.singleton(value), executionParameters)
							.map((atomizedValue) => castToType(atomizedValue, ValueType.XSSTRING))
							.first().value;

			newMessage += `{type: ${valueTypeToString(value.type)}, value: ${argumentAsString}}\n`;
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
