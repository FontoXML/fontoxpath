import createAtomicValue from '../dataTypes/createAtomicValue';
import SequenceFactory from '../dataTypes/SequenceFactory';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnYearsFromDuration: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return SequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getYears(), 'xs:integer')
	);
};

const fnMonthsFromDuration: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return SequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getMonths(), 'xs:integer')
	);
};

const fnDaysFromDuration: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return SequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getDays(), 'xs:integer')
	);
};

const fnHoursFromDuration: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return SequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getHours(), 'xs:integer')
	);
};

const fnMinutesFromDuration: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return SequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getMinutes(), 'xs:integer')
	);
};

const fnSecondsFromDuration: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return SequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getSeconds(), 'xs:decimal')
	);
};

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'years-from-duration',
			argumentTypes: ['xs:duration?'],
			returnType: 'xs:integer?',
			callFunction: fnYearsFromDuration
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'months-from-duration',
			argumentTypes: ['xs:duration?'],
			returnType: 'xs:integer?',
			callFunction: fnMonthsFromDuration
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'days-from-duration',
			argumentTypes: ['xs:duration?'],
			returnType: 'xs:integer?',
			callFunction: fnDaysFromDuration
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'hours-from-duration',
			argumentTypes: ['xs:duration?'],
			returnType: 'xs:integer?',
			callFunction: fnHoursFromDuration
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'minutes-from-duration',
			argumentTypes: ['xs:duration?'],
			returnType: 'xs:integer?',
			callFunction: fnMinutesFromDuration
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'seconds-from-duration',
			argumentTypes: ['xs:duration?'],
			returnType: 'xs:decimal?',
			callFunction: fnSecondsFromDuration
		}
	]
};
