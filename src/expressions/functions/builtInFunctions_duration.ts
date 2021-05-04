import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { BaseType, SequenceType } from '../dataTypes/Value';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
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
		createAtomicValue(sequence.first().value.getYears(), {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		createAtomicValue(sequence.first().value.getMonths(), {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		createAtomicValue(sequence.first().value.getDays(), {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		createAtomicValue(sequence.first().value.getHours(), {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		createAtomicValue(sequence.first().value.getMinutes(), {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		createAtomicValue(sequence.first().value.getSeconds(), {
			kind: BaseType.XSDECIMAL,
			seqType: SequenceType.EXACTLY_ONE,
		})
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'years-from-duration',
		argumentTypes: [{ kind: BaseType.XSDURATION, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnYearsFromDuration,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'months-from-duration',
		argumentTypes: [{ kind: BaseType.XSDURATION, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnMonthsFromDuration,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'days-from-duration',
		argumentTypes: [{ kind: BaseType.XSDURATION, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnDaysFromDuration,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'hours-from-duration',
		argumentTypes: [{ kind: BaseType.XSDURATION, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnHoursFromDuration,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'minutes-from-duration',
		argumentTypes: [{ kind: BaseType.XSDURATION, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnMinutesFromDuration,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'seconds-from-duration',
		argumentTypes: [{ kind: BaseType.XSDURATION, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDECIMAL, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnSecondsFromDuration,
	},
];

export default {
	declarations,
};
