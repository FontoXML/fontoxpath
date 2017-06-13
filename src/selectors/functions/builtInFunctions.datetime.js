import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import DateTime from '../dataTypes/valueTypes/DateTime';

function fnDateTime (_dynamicContext, sequence, arg2) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	if (arg2.isEmpty()) {
		return arg2;
	}

	const date = sequence.first().value;
	const time = arg2.first().value;

	const dateTimezone = date.getTimezone();
	const timeTimezone = time.getTimezone();
	let timezoneToUse;

	if (!dateTimezone && !timeTimezone) {
		timezoneToUse = null;
	}
	else if (dateTimezone && !timeTimezone) {
		timezoneToUse = dateTimezone;
	}
	else if (!dateTimezone && timeTimezone) {
		timezoneToUse = timeTimezone;
	}
	else if (dateTimezone.equals(timeTimezone)) {
		timezoneToUse = dateTimezone;
	}
	else {
		throw new Error('FORG0008: fn:dateTime: got a date and time value with different timezones.');
	}

	const dateTime = new DateTime(
		date.getYear(),
		date.getMonth(),
		date.getDay(),
		time.getHours(),
		time.getMinutes(),
		time.getSeconds(),
		time.getSecondFraction(),
		timezoneToUse);
	return Sequence.singleton(createAtomicValue(dateTime, 'xs:dateTime'));
}

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
	return Sequence.singleton(createAtomicValue(sequence.first().value.getFullSeconds(), 'xs:decimal'));
}

function fnTimezoneFromDateTime (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const timezone = sequence.first().value.getTimezone();
	if (!timezone) {
		return Sequence.empty();
	}

	return Sequence.singleton(createAtomicValue(timezone, 'xs:dayTimeDuration'));
}

export default {
	declarations: [
		{
			name: 'dateTime',
			argumentTypes: ['xs:date?', 'xs:time?'],
			returnType: 'xs:dateTime?',
			callFunction: fnDateTime
		},
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
		{
			name: 'timezone-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:dayTimeDuration?',
			callFunction: fnTimezoneFromDateTime
		},
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
		{
			name: 'timezone-from-date',
			argumentTypes: ['xs:date?'],
			returnType: 'xs:dayTimeDuration?',
			callFunction: fnTimezoneFromDateTime
		},
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
		},
		{
			name: 'timezone-from-time',
			argumentTypes: ['xs:time?'],
			returnType: 'xs:dayTimeDuration?',
			callFunction: fnTimezoneFromDateTime
		}
	]
};
