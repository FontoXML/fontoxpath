import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import DateTime from '../dataTypes/valueTypes/DateTime';
import DayTimeDuration from '../dataTypes/valueTypes/DayTimeDuration';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
	arg2,
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
			'FORG0008: fn:dateTime: got a date and time value with different timezones.',
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
		timezoneToUse,
	);
	return sequenceFactory.singleton(createAtomicValue(dateTime, ValueType.XSDATETIME));
};

const fnYearFromDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getYear(), ValueType.XSINTEGER),
	);
};

const fnMonthFromDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getMonth(), ValueType.XSINTEGER),
	);
};

const fnDayFromDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getDay(), ValueType.XSINTEGER),
	);
};

const fnHoursFromDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getHours(), ValueType.XSINTEGER),
	);
};

const fnMinutesFromDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getMinutes(), ValueType.XSINTEGER),
	);
};

const fnSecondsFromDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(
		createAtomicValue(sequence.first().value.getFullSeconds(), ValueType.XSDECIMAL),
	);
};
const fnTimezoneFromDateTime: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const timezone = sequence.first().value.getTimezone();
	if (!timezone) {
		return sequenceFactory.empty();
	}

	return sequenceFactory.singleton(createAtomicValue(timezone, ValueType.XSDAYTIMEDURATION));
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'dateTime',
		argumentTypes: [
			{ type: ValueType.XSDATE, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSTIME, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSDATETIME, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'year-from-dateTime',
		argumentTypes: [{ type: ValueType.XSDATETIME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnYearFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'month-from-dateTime',
		argumentTypes: [{ type: ValueType.XSDATETIME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnMonthFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'day-from-dateTime',
		argumentTypes: [{ type: ValueType.XSDATETIME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnDayFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'hours-from-dateTime',
		argumentTypes: [{ type: ValueType.XSDATETIME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnHoursFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'minutes-from-dateTime',
		argumentTypes: [{ type: ValueType.XSDATETIME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnMinutesFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'seconds-from-dateTime',
		argumentTypes: [{ type: ValueType.XSDATETIME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDECIMAL, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnSecondsFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'timezone-from-dateTime',
		argumentTypes: [{ type: ValueType.XSDATETIME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: {
			type: ValueType.XSDAYTIMEDURATION,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		},
		callFunction: fnTimezoneFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'year-from-date',
		argumentTypes: [{ type: ValueType.XSDATE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnYearFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'month-from-date',
		argumentTypes: [{ type: ValueType.XSDATE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnMonthFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'day-from-date',
		argumentTypes: [{ type: ValueType.XSDATE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnDayFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'timezone-from-date',
		argumentTypes: [{ type: ValueType.XSDATE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: {
			type: ValueType.XSDAYTIMEDURATION,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		},
		callFunction: fnTimezoneFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'hours-from-time',
		argumentTypes: [{ type: ValueType.XSTIME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnHoursFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'minutes-from-time',
		argumentTypes: [{ type: ValueType.XSTIME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnMinutesFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'seconds-from-time',
		argumentTypes: [{ type: ValueType.XSTIME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSDECIMAL, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnSecondsFromDateTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'timezone-from-time',
		argumentTypes: [{ type: ValueType.XSTIME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: {
			type: ValueType.XSDAYTIMEDURATION,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		},
		callFunction: fnTimezoneFromDateTime,
	},
];

export default {
	declarations,
};
