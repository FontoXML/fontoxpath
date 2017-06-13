import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';


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
			name: 'years-from-duration',
			argumentTypes: ['xs:duration?'],
			returnType: 'xs:integer?',
			callFunction: fnYearsFromDuration
		},
		{
			name: 'months-from-duration',
			argumentTypes: ['xs:duration?'],
			returnType: 'xs:integer?',
			callFunction: fnMonthsFromDuration
		},
		{
			name: 'days-from-duration',
			argumentTypes: ['xs:duration?'],
			returnType: 'xs:integer?',
			callFunction: fnDaysFromDuration
		},
		{
			name: 'hours-from-duration',
			argumentTypes: ['xs:duration?'],
			returnType: 'xs:integer?',
			callFunction: fnHoursFromDuration
		},
		{
			name: 'minutes-from-duration',
			argumentTypes: ['xs:duration?'],
			returnType: 'xs:integer?',
			callFunction: fnMinutesFromDuration
		},
		{
			name: 'seconds-from-duration',
			argumentTypes: ['xs:duration?'],
			returnType: 'xs:decimal?',
			callFunction: fnSecondsFromDuration
		}
	]
};
