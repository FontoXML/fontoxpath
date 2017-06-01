import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';

function fnYearFromDateTime (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.getYear(), 'xs:integer'));
}

function fnMonthFromDateTime (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.getMonth(), 'xs:integer'));
}

function fnDayFromDateTime (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.getDay(), 'xs:integer'));
}

function fnHoursFromDateTime (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.getHours(), 'xs:integer'));
}

function fnMinutesFromDateTime (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.getMinutes(), 'xs:integer'));
}

function fnSecondsFromDateTime (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.getSeconds(), 'xs:decimal'));
}

// fnTimezoneFromDateTime

export default {
	declarations: [
		{
			name: 'year-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:integer?',
			callFunction: fnYearFromDateTime
		},
		{
			name: 'month-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:integer?',
			callFunction: fnMonthFromDateTime
		},
		{
			name: 'day-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:integer?',
			callFunction: fnDayFromDateTime
		},
		{
			name: 'hours-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:integer?',
			callFunction: fnHoursFromDateTime
		},
		{
			name: 'minutes-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:integer?',
			callFunction: fnMinutesFromDateTime
		},
		{
			name: 'seconds-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:decimal?',
			callFunction: fnSecondsFromDateTime
		},
		// timezone-from-dateTime
		{
			name: 'year-from-date',
			argumentTypes: ['xs:date?'],
			returnType: 'xs:integer?',
			callFunction: fnYearFromDateTime
		},
		{
			name: 'month-from-date',
			argumentTypes: ['xs:date?'],
			returnType: 'xs:integer?',
			callFunction: fnMonthFromDateTime
		},
		{
			name: 'day-from-date',
			argumentTypes: ['xs:date?'],
			returnType: 'xs:integer?',
			callFunction: fnDayFromDateTime
		},
		// timezone-from-date
		{
			name: 'hours-from-time',
			argumentTypes: ['xs:time?'],
			returnType: 'xs:integer?',
			callFunction: fnHoursFromDateTime
		},
		{
			name: 'minutes-from-time',
			argumentTypes: ['xs:time?'],
			returnType: 'xs:integer?',
			callFunction: fnMinutesFromDateTime
		},
		{
			name: 'seconds-from-time',
			argumentTypes: ['xs:time?'],
			returnType: 'xs:decimal?',
			callFunction: fnSecondsFromDateTime
		}
		// timezone-from-time
	],
	functions: {}
};
