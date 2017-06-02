import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';


function fnYearsFromDuration (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const duration = sequence.first().value;
	const years = duration.getYears();
	const returnValue = years === 0 || duration.isPositive() ? years : -years;

	return Sequence.singleton(createAtomicValue(returnValue, 'xs:integer'));
}

function fnMonthsFromDuration (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const duration = sequence.first().value;
	const months = duration.getMonths();
	const returnValue = months === 0 || duration.isPositive() ? months : -months;

	return Sequence.singleton(createAtomicValue(returnValue, 'xs:integer'));
}

function fnDaysFromDuration (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const duration = sequence.first().value;
	const days = duration.getDays();
	const returnValue = days === 0 || duration.isPositive() ? days : -days;

	return Sequence.singleton(createAtomicValue(returnValue, 'xs:integer'));
}

function fnHoursFromDuration (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const duration = sequence.first().value;
	const hours = duration.getHours();
	const returnValue = hours === 0 || duration.isPositive() ? hours : -hours;

	return Sequence.singleton(createAtomicValue(returnValue, 'xs:integer'));
}

function fnMinutesFromDuration (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const duration = sequence.first().value;
	const minutes = duration.getMinutes();
	const returnValue = minutes === 0 || duration.isPositive() ? minutes : -minutes;

	return Sequence.singleton(createAtomicValue(returnValue, 'xs:integer'));
}

function fnSecondsFromDuration (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const duration = sequence.first().value;
	const seconds = duration.getSeconds();
	const returnValue = seconds === 0 || duration.isPositive() ? seconds : -seconds;

	return Sequence.singleton(createAtomicValue(returnValue, 'xs:decimal'));
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
