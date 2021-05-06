import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType } from '../dataTypes/Value';
import { BaseType } from '../dataTypes/BaseType';
import DateTime from '../dataTypes/valueTypes/DateTime';
import DayTimeDuration from '../dataTypes/valueTypes/DayTimeDuration';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import { BuiltinDeclarationType } from './builtInFunctions';
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
	return sequenceFactory.singleton(
		createAtomicValue(dateTime, {
			kind: BaseType.XSDATETIME,
			seqType: SequenceType.EXACTLY_ONE,
		})
	);
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
		createAtomicValue(sequence.first().value.getYear(), {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		createAtomicValue(sequence.first().value.getMonth(), {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		createAtomicValue(sequence.first().value.getDay(), {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		createAtomicValue(sequence.first().value.getHours(), {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		createAtomicValue(sequence.first().value.getMinutes(), {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		createAtomicValue(sequence.first().value.getFullSeconds(), {
			kind: BaseType.XSDECIMAL,
			seqType: SequenceType.EXACTLY_ONE,
		})
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
		createAtomicValue(timezone, {
			kind: BaseType.XSDAYTIMEDURATION,
			seqType: SequenceType.EXACTLY_ONE,
		})
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'dateTime',
		argumentTypes: [
			{ kind: BaseType.XSDATE, seqType: SequenceType.ZERO_OR_ONE },
			{ kind: BaseType.XSTIME, seqType: SequenceType.ZERO_OR_ONE },
		],
		returnType: { kind: BaseType.XSDATETIME, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'year-from-dateTime',
		argumentTypes: [{ kind: BaseType.XSDATETIME, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnYearFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'month-from-dateTime',
		argumentTypes: [{ kind: BaseType.XSDATETIME, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnMonthFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'day-from-dateTime',
		argumentTypes: [{ kind: BaseType.XSDATETIME, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnDayFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'hours-from-dateTime',
		argumentTypes: [{ kind: BaseType.XSDATETIME, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnHoursFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'minutes-from-dateTime',
		argumentTypes: [{ kind: BaseType.XSDATETIME, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnMinutesFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'seconds-from-dateTime',
		argumentTypes: [{ kind: BaseType.XSDATETIME, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDECIMAL, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnSecondsFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'timezone-from-dateTime',
		argumentTypes: [{ kind: BaseType.XSDATETIME, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnTimezoneFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'year-from-date',
		argumentTypes: [{ kind: BaseType.XSDATE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnYearFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'month-from-date',
		argumentTypes: [{ kind: BaseType.XSDATE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnMonthFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'day-from-date',
		argumentTypes: [{ kind: BaseType.XSDATE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnDayFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'timezone-from-date',
		argumentTypes: [{ kind: BaseType.XSDATE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnTimezoneFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'hours-from-time',
		argumentTypes: [{ kind: BaseType.XSTIME, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnHoursFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'minutes-from-time',
		argumentTypes: [{ kind: BaseType.XSTIME, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnMinutesFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'seconds-from-time',
		argumentTypes: [{ kind: BaseType.XSTIME, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDECIMAL, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnSecondsFromDateTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'timezone-from-time',
		argumentTypes: [{ kind: BaseType.XSTIME, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: fnTimezoneFromDateTime,
	},
];

export default {
	declarations,
};
