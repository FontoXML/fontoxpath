import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { BaseType } from '../dataTypes/Value';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
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
		createAtomicValue(sequence.first().value.getYears(), { kind: BaseType.XSINTEGER })
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
		createAtomicValue(sequence.first().value.getMonths(), { kind: BaseType.XSINTEGER })
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
		createAtomicValue(sequence.first().value.getDays(), { kind: BaseType.XSINTEGER })
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
		createAtomicValue(sequence.first().value.getHours(), { kind: BaseType.XSINTEGER })
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
		createAtomicValue(sequence.first().value.getMinutes(), { kind: BaseType.XSINTEGER })
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
		createAtomicValue(sequence.first().value.getSeconds(), { kind: BaseType.XSDECIMAL })
	);
};

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'years-from-duration',
			argumentTypes: [{kind: BaseType.NULLABLE, item: { kind: BaseType.XSDURATION}}],
			returnType: {kind: BaseType.NULLABLE, item: { kind: BaseType.XSINTEGER}},
			callFunction: fnYearsFromDuration,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'months-from-duration',
			argumentTypes: [{kind: BaseType.NULLABLE, item: { kind: BaseType.XSDURATION}}],
			returnType: {kind: BaseType.NULLABLE, item: { kind: BaseType.XSINTEGER}},
			callFunction: fnMonthsFromDuration,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'days-from-duration',
			argumentTypes: [{kind: BaseType.NULLABLE, item: { kind: BaseType.XSDURATION}}],
			returnType: {kind: BaseType.NULLABLE, item: { kind: BaseType.XSINTEGER}},
			callFunction: fnDaysFromDuration,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'hours-from-duration',
			argumentTypes: [{kind: BaseType.NULLABLE, item: { kind: BaseType.XSDURATION}}],
			returnType: {kind: BaseType.NULLABLE, item: { kind: BaseType.XSINTEGER}},
			callFunction: fnHoursFromDuration,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'minutes-from-duration',
			argumentTypes: [{kind: BaseType.NULLABLE, item: { kind: BaseType.XSDURATION}}],
			returnType: {kind: BaseType.NULLABLE, item: { kind: BaseType.XSINTEGER}},
			callFunction: fnMinutesFromDuration,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'seconds-from-duration',
			argumentTypes: [{kind: BaseType.NULLABLE, item: { kind: BaseType.XSDURATION}}],
			returnType: {kind: BaseType.NULLABLE, item: { kind: BaseType.XSDECIMAL}},
			callFunction: fnSecondsFromDuration,
		},
	],
};
