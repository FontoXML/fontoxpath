import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';


function fnYearsFromDuration (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.getYears(), 'xs:integer'));
}

function fnMonthsFromDuration (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.getMonths(), 'xs:integer'));
}

function fnDaysFromDuration (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.getDays(), 'xs:integer'));
}

function fnHoursFromDuration (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.getHours(), 'xs:integer'));
}

function fnMinutesFromDuration (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.getMinutes(), 'xs:integer'));
}

function fnSecondsFromDuration (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.getSeconds(), 'xs:decimal'));
}

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
