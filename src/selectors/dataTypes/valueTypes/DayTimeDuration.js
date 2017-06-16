import AbstractDuration from './AbstractDuration';

/**
 * @extends {AbstractDuration}
 */
class DayTimeDuration extends AbstractDuration {
	constructor (seconds) {
		super();

		if (seconds > Number.MAX_SAFE_INTEGER || seconds < Number.MIN_SAFE_INTEGER) {
			throw new Error('FODT0002: Number of seconds given to construct DayTimeDuration overflows MAX_SAFE_INTEGER or MIN_SAFE_INTEGER');
		}

		this._seconds = seconds;
	}

	getRawSeconds () {
		return this._seconds;
	}

	getDays () {
		return Math.trunc(this._seconds / 86400);
	}

	getHours () {
		return Math.trunc((this._seconds % 86400) / 3600);
	}

	getMinutes () {
		return Math.trunc((this._seconds % 3600) / 60);
	}

	getSeconds () {
		const result = this._seconds % 60;
		return Object.is(-0, result) ? 0 : result;
	}

	isPositive () {
		return Object.is(-0, this._seconds) ? false : this._seconds >= 0;
	}

	toStringWithoutP () {
		const days = Math.abs(this.getDays());
		const hours = Math.abs(this.getHours());
		const minutes = Math.abs(this.getMinutes());
		const seconds = Math.abs(this.getSeconds());
		const stringValue = `${days ? `${days}DT` : 'T'}` +
			`${hours ? `${hours}H` : ''}` +
			`${minutes ? `${minutes}M` : ''}` +
			`${seconds ? `${seconds}S` : ''}`;

		return stringValue === 'T' ? 'T0S' : stringValue;
	}

	toString () {
		return (this.isPositive() ? 'P' : '-P') + this.toStringWithoutP();
	}
}

/**
 * @static
 * @param   {number}  days
 * @param   {number}  hours
 * @param   {number}  minutes
 * @param   {number}  seconds
 * @param   {number}  secondFraction
 * @param   {boolean} isPositive
 * @return  {DayTimeDuration}
 */
DayTimeDuration.fromParts = function (days, hours, minutes, seconds, secondFraction, isPositive) {
	const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds + secondFraction;
	return new DayTimeDuration(isPositive || totalSeconds === 0 ? totalSeconds : -totalSeconds);
};

/**
 * @static
 * @param   {string}  string
 * @return  {?DayTimeDuration}
 */
DayTimeDuration.fromString = function (string) {
	const regex = /^(-)?P(\d+Y)?(\d+M)?(\d+D)?(?:T(\d+H)?(\d+M)?(\d+(\.\d*)?S)?)?$/;
	const match = regex.exec(string);

	if (!match) {
		return null;
	}

	const isPositive = !match[1];
	const days = match[4] ? parseInt(match[4], 10) : 0;
	const hours = match[5] ? parseInt(match[5], 10) : 0;
	const minutes = match[6] ? parseInt(match[6], 10) : 0;
	const seconds = match[7] ? parseInt(match[7], 10) : 0;
	const secondFraction = match[8] ? parseFloat(match[8]) : 0;

	return DayTimeDuration.fromParts(days, hours, minutes, seconds, secondFraction, isPositive);
};

/**
 * @static
 * @param   {string}  string
 * @return  {DayTimeDuration}
 */
DayTimeDuration.fromTimezoneString = function (string) {
	const regex = /^(Z)|([+-])([01]\d):([0-5]\d)$/;
	const match = regex.exec(string);

	if (match[1] === 'Z') {
		return DayTimeDuration.fromParts(0, 0, 0, 0, 0, true);
	}

	const isPositive = match[2] === '+';
	const hours = match[3] ? parseInt(match[3], 10) : 0;
	const minutes = match[4] ? parseInt(match[4], 10) : 0;

	return DayTimeDuration.fromParts(0, hours, minutes, 0, 0, isPositive);
};

/**
 * @static
 * @param   {Date}  date
 * @return  {DayTimeDuration}
 */
DayTimeDuration.fromJavascriptDateTimezone = function (date) {
	const minutes = date.getTimezoneOffset();
	const isPositive = minutes > -1;

	return DayTimeDuration.fromParts(0, 0, Math.abs(minutes), 0, 0, isPositive);
};

/**
 * @param   {DayTimeDuration}  dayTimeDuration1
 * @param   {DayTimeDuration}  dayTimeDuration2
 * @return  {boolean}
 */
export function lessThan (dayTimeDuration1, dayTimeDuration2) {
	return dayTimeDuration1._seconds < dayTimeDuration2._seconds;
}

/**
 * @param   {DayTimeDuration}  dayTimeDuration1
 * @param   {DayTimeDuration}  dayTimeDuration2
 * @return  {boolean}
 */
export function greaterThan (dayTimeDuration1, dayTimeDuration2) {
	return dayTimeDuration1._seconds > dayTimeDuration2._seconds;
}

/**
 * @param   {DayTimeDuration}  dayTimeDuration1
 * @param   {DayTimeDuration}  dayTimeDuration2
 * @return  {DayTimeDuration}
 */
export function add (dayTimeDuration1, dayTimeDuration2) {
	return new DayTimeDuration(dayTimeDuration1._seconds + dayTimeDuration2._seconds);
}

/**
 * @param   {DayTimeDuration}  dayTimeDuration1
 * @param   {DayTimeDuration}  dayTimeDuration2
 * @return  {DayTimeDuration}
 */
export function subtract (dayTimeDuration1, dayTimeDuration2) {
	return new DayTimeDuration(dayTimeDuration1._seconds - dayTimeDuration2._seconds);
}

/**
 * @param   {DayTimeDuration}  dayTimeDuration
 * @param   {number}           double
 * @return  {DayTimeDuration}
 */
export function multiply (dayTimeDuration, double) {
	if (isNaN(double)) {
		throw new Error('FOCA0005: Cannot multiply xs:dayTimeDuration by NaN');
	}
	const result = dayTimeDuration._seconds * double;
	if (result > Number.MAX_SAFE_INTEGER || !Number.isFinite(result)) {
		throw new Error('FODT0002: Value overflow while multiplying xs:dayTimeDuration');
	}
	return new DayTimeDuration(result < Number.MIN_SAFE_INTEGER || Object.is(-0, result) ? 0 : result);
}

/**
 * @param   {DayTimeDuration}  dayTimeDuration
 * @param   {number}           double
 * @return  {DayTimeDuration}
 */
export function divide (dayTimeDuration, double) {
	if (isNaN(double)) {
		throw new Error('FOCA0005: Cannot divide xs:dayTimeDuration by NaN');
	}
	const result = dayTimeDuration._seconds / double;
	if (result > Number.MAX_SAFE_INTEGER || !Number.isFinite(result)) {
		throw new Error('FODT0002: Value overflow while dividing xs:dayTimeDuration');
	}
	return new DayTimeDuration(result < Number.MIN_SAFE_INTEGER || Object.is(-0, result) ? 0 : result);
}

/**
 * @param   {DayTimeDuration}  dayTimeDuration1
 * @param   {DayTimeDuration}  dayTimeDuration2
 * @return  {number}
 */
export function divideByDayTimeDuration (dayTimeDuration1, dayTimeDuration2) {
	if (dayTimeDuration2._seconds === 0) {
		throw new Error('FOAR0001: Division by 0');
	}
	return dayTimeDuration1._seconds / dayTimeDuration2._seconds;
}

export default DayTimeDuration;
