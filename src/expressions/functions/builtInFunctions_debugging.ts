import atomize from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType } from '../dataTypes/Value';
import { BaseType } from '../dataTypes/BaseType';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
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
			.map((value) =>
				castToType(value, { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
			)
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
		argumentTypes: [{ kind: BaseType.ITEM, seqType: SequenceType.ZERO_OR_MORE }],
		callFunction: fnTrace,
		localName: 'trace',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: { kind: BaseType.ITEM, seqType: SequenceType.ZERO_OR_MORE },
	},
	{
		argumentTypes: [
			{ kind: BaseType.ITEM, seqType: SequenceType.ZERO_OR_MORE },
			{ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE },
		],
		callFunction: fnTrace,
		localName: 'trace',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: { kind: BaseType.ITEM, seqType: SequenceType.ZERO_OR_MORE },
	},
];

export default {
	declarations,
};
