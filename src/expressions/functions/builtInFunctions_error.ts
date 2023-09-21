import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnError: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	code,
	description,
) => {
	const codeQName =
		code === undefined || code.isEmpty()
			? new QName('err', 'http://www.w3.org/2005/xqt-errors', 'FOER0000')
			: code.first().value;
	let descriptionMessage = '';
	if (description !== undefined && !description.isEmpty()) {
		descriptionMessage = `: ${description.first().value}`;
	}
	throw new Error(`${codeQName.localName}${descriptionMessage}`);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'error',
		argumentTypes: [],
		returnType: { type: ValueType.NONE, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnError,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'error',
		argumentTypes: [{ type: ValueType.XSQNAME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.NONE, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnError,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'error',
		argumentTypes: [
			{ type: ValueType.XSQNAME, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.NONE, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnError,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'error',
		argumentTypes: [
			{ type: ValueType.XSQNAME, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
		],
		returnType: { type: ValueType.NONE, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction(
			_dynamicContext,
			_executionParameters,
			_staticContext,
			_input,
			_pattern,
			_flags,
		) {
			throw new Error('Not implemented: Using an error object in error is not supported');
		},
	},
];

export default {
	declarations,
	functions: {
		error: fnError,
	},
};
