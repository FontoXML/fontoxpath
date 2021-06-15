import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnYearsFromDuration: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getYears(), ValueType.XSINTEGER)
	);
};

const fnMonthsFromDuration: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getMonths(), ValueType.XSINTEGER)
	);
};

const fnDaysFromDuration: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getDays(), ValueType.XSINTEGER)
	);
};

const fnHoursFromDuration: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getHours(), ValueType.XSINTEGER)
	);
};

const fnMinutesFromDuration: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getMinutes(), ValueType.XSINTEGER)
	);
};

const fnSecondsFromDuration: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getSeconds(), ValueType.XSDECIMAL)
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'years-from-duration',
		argumentTypes: [{ type: ValueType.XSDURATION, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnYearsFromDuration,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'months-from-duration',
		argumentTypes: [{ type: ValueType.XSDURATION, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnMonthsFromDuration,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'days-from-duration',
		argumentTypes: [{ type: ValueType.XSDURATION, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnDaysFromDuration,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'hours-from-duration',
		argumentTypes: [{ type: ValueType.XSDURATION, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnHoursFromDuration,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'minutes-from-duration',
		argumentTypes: [{ type: ValueType.XSDURATION, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnMinutesFromDuration,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'seconds-from-duration',
		argumentTypes: [{ type: ValueType.XSDURATION, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDECIMAL, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnSecondsFromDuration,
	},
];

export default {
	declarations,
};
