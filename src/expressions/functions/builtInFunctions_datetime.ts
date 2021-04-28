import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { BaseType } from '../dataTypes/Value';
import DateTime from '../dataTypes/valueTypes/DateTime';
import DayTimeDuration from '../dataTypes/valueTypes/DayTimeDuration';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
	arg2
) => {
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
	let timezoneToUse: DayTimeDuration | null;

	if (!dateTimezone && !timeTimezone) {
		timezoneToUse = null;
	} else if (dateTimezone && !timeTimezone) {
		timezoneToUse = dateTimezone;
	} else if (!dateTimezone && timeTimezone) {
		timezoneToUse = timeTimezone;
	} else if (dateTimezone.equals(timeTimezone)) {
		timezoneToUse = dateTimezone;
	} else {
		throw new Error(
			'FORG0008: fn:dateTime: got a date and time value with different timezones.'
		);
	}

	const dateTime = new DateTime(
		date.getYear(),
		date.getMonth(),
		date.getDay(),
		time.getHours(),
		time.getMinutes(),
		time.getSeconds(),
		time.getSecondFraction(),
		timezoneToUse
	);
	return sequenceFactory.singleton(createAtomicValue(dateTime, { kind: BaseType.XSDATETIME }));
};

const fnYearFromDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getYear(), { kind: BaseType.XSINTEGER })
	);
};

const fnMonthFromDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getMonth(), { kind: BaseType.XSINTEGER })
	);
};

const fnDayFromDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getDay(), { kind: BaseType.XSINTEGER })
	);
};

const fnHoursFromDateTime: FunctionDefinitionType = (
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

const fnMinutesFromDateTime: FunctionDefinitionType = (
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

const fnSecondsFromDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getFullSeconds(), { kind: BaseType.XSDECIMAL })
	);
};
const fnTimezoneFromDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const timezone = sequence.first().value.getTimezone();
	if (!timezone) {
		return sequenceFactory.empty();
	}

	return sequenceFactory.singleton(
		createAtomicValue(timezone, { kind: BaseType.XSDAYTIMEDURATION })
	);
};

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'dateTime',
			argumentTypes: ['xs:date?', 'xs:time?'],
			returnType: 'xs:dateTime?',
			callFunction: fnDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'year-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:integer?',
			callFunction: fnYearFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'month-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:integer?',
			callFunction: fnMonthFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'day-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:integer?',
			callFunction: fnDayFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'hours-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:integer?',
			callFunction: fnHoursFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'minutes-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:integer?',
			callFunction: fnMinutesFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'seconds-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:decimal?',
			callFunction: fnSecondsFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'timezone-from-dateTime',
			argumentTypes: ['xs:dateTime?'],
			returnType: 'xs:dayTimeDuration?',
			callFunction: fnTimezoneFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'year-from-date',
			argumentTypes: ['xs:date?'],
			returnType: 'xs:integer?',
			callFunction: fnYearFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'month-from-date',
			argumentTypes: ['xs:date?'],
			returnType: 'xs:integer?',
			callFunction: fnMonthFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'day-from-date',
			argumentTypes: ['xs:date?'],
			returnType: 'xs:integer?',
			callFunction: fnDayFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'timezone-from-date',
			argumentTypes: ['xs:date?'],
			returnType: 'xs:dayTimeDuration?',
			callFunction: fnTimezoneFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'hours-from-time',
			argumentTypes: ['xs:time?'],
			returnType: 'xs:integer?',
			callFunction: fnHoursFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'minutes-from-time',
			argumentTypes: ['xs:time?'],
			returnType: 'xs:integer?',
			callFunction: fnMinutesFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'seconds-from-time',
			argumentTypes: ['xs:time?'],
			returnType: 'xs:decimal?',
			callFunction: fnSecondsFromDateTime,
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'timezone-from-time',
			argumentTypes: ['xs:time?'],
			returnType: 'xs:dayTimeDuration?',
			callFunction: fnTimezoneFromDateTime,
		},
	],
};
