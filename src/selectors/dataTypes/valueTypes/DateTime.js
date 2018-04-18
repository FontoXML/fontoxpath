import DayTimeDuration from './DayTimeDuration';

/**
 * @param   {string|undefined}  match
 * @return  {number|null}
 */
function parseMatch (match) {
	return match ? parseInt(match, 10) : null;
}

/**
 * @param   {DateTime}  dateTime1
 * @param   {DateTime}  dateTime2
 * @return  {number}
 */
function compareNormalizedDateTime (dateTime1, dateTime2) {
	if (dateTime1._years > dateTime2._years) {
		return 1;
	}

	if (dateTime1._years < dateTime2._years) {
		return -1;
	}

	const bothPositive = dateTime1.isPositive() && dateTime2.isPositive();
	const fields = [
		[dateTime1._months, dateTime2._months],
		[dateTime1._days, dateTime2._days],
		[dateTime1._hours, dateTime2._hours],
		[dateTime1._minutes, dateTime2._minutes],
		[dateTime1._seconds, dateTime2._seconds],
		[dateTime1._secondFraction, dateTime2._secondFraction]
	];

	for (let i = 0; i < 6; i++) {
		if (fields[i][0] > fields[i][1]) {
			return bothPositive ? 1 : -1;
		}
		if (fields[i][0] < fields[i][1]) {
			return bothPositive ? -1 : 1;
		}
	}

	return 0;
}

/**
 * @param   {number}  year
 * @return  {string}
 */
function convertYearToString (year) {
	let string = year + '';
	const isNegative = string.startsWith('-');
	if (isNegative) {
		string = string.substring(1);
	}
	return (isNegative ? '-' : '') + string.padStart(4, '0');
}

/**
 * @param   {number}  value
 * @return  {string}
 */
function convertToTwoCharString (value) {
	const string = value + '';
	return string.padStart(2, '0');
}

/**
 * @param   {number}  seconds
 * @return  {string}
 */
function convertSecondsToString (seconds) {
	let string = seconds + '';
	if (string.split('.')[0].length === 1) {
		string = string.padStart(string.length + 1, '0');
	}
	return string;
}

/**
 * @param   {DayTimeDuration}  timezone
 * @return  {boolean}
 */
function isUTC (timezone) {
	return timezone.getHours() === 0 && timezone.getMinutes() === 0;
}

/**
 * @param   {DayTimeDuration} timezone
 * @return  {string}
 */
function timezoneToString (timezone) {
	if (isUTC(timezone)) {
		return 'Z';
	}

	return (timezone.isPositive() ? '+' : '-') +
		convertToTwoCharString(Math.abs(timezone.getHours())) + ':' +
		convertToTwoCharString(Math.abs(timezone.getMinutes()));
}

class DateTime {
	constructor (years, months, days, hours, minutes, seconds, secondFraction, timezone, type = 'xs:dateTime') {
		this._years = years;
		this._months = months;
		this._days = days + (hours === 24 ? 1 : 0);
		this._hours = hours === 24 ? 0 : hours;
		this._minutes = minutes;
		this._seconds = seconds;
		this._secondFraction = secondFraction;
		this._timezone = timezone;
		this._type = type;
	}

	getYear () {
		return this._years;
	}

	getMonth () {
		return this._months;
	}

	getDay () {
		return this._days;
	}

	getHours () {
		return this._hours;
	}

	getMinutes () {
		return this._minutes;
	}

	getSeconds () {
		return this._seconds;
	}

	getFullSeconds () {
		return this._seconds + this._secondFraction;
	}

	getSecondFraction () {
		return this._secondFraction;
	}

	getTimezone () {
		return this._timezone;
	}

	isPositive () {
		return this._years >= 0;
	}

	toJavaScriptDate (implicitTimezone) {
		const timezoneToUse = this._timezone || implicitTimezone || DayTimeDuration.fromTimezoneString('Z');
		return new Date(
			this._years,
			this._months - 1,
			this._days,
			this._hours - timezoneToUse.getHours(),
			this._minutes - timezoneToUse.getMinutes(),
			this._seconds + this._secondFraction
		);
	}

	normalize (timezone = undefined) {
		if (timezone === undefined && (this._timezone === null || isUTC(this._timezone))) {
			// Noting to normalize
			return this;
		}

		const jsDate = this.toJavaScriptDate(timezone || this._timezone);
		const years = jsDate.getFullYear();
		const months = jsDate.getMonth() + 1;
		const days = jsDate.getDate();
		const hours = jsDate.getHours();
		const minutes = jsDate.getMinutes();

		return new DateTime(years, months, days, hours, minutes, this._seconds, this._secondFraction, DayTimeDuration.fromTimezoneString('Z'), this._type);
	}

	// returns -1 if this < other, 0 if this === other, 1 if this > other, undefined if indeterminate
	/**
	 * @param   {DateTime}  other
	 * @return  {number|undefined}
	 */
	compare (other) {
		const normalizedThis = this.normalize();
		const normalizedOther = other.normalize();

		// Both have a timezone (Z at this point) or both do not have any timezone
		if (normalizedThis._timezone && normalizedOther._timezone ||
			!normalizedThis._timezone && !normalizedOther._timezone) {
			return compareNormalizedDateTime(normalizedThis, normalizedOther);
		}

		// If only this has a timezone
		if (normalizedThis._timezone && !normalizedOther._timezone) {
			const normalizedOtherMin = other.normalize(DayTimeDuration.fromTimezoneString('+14:00'));
			const normalizedOtherMax = other.normalize(DayTimeDuration.fromTimezoneString('-14:00'));

			if (compareNormalizedDateTime(normalizedThis, normalizedOtherMin) < 0) {
				return -1;
			}

			if (compareNormalizedDateTime(normalizedThis, normalizedOtherMax) > 0) {
				return 1;
			}

			return undefined;
		}

		// If only other has a timezone
		const normalizedThisMin = this.normalize(DayTimeDuration.fromTimezoneString('+14:00'));
		const normalizedThisMax = this.normalize(DayTimeDuration.fromTimezoneString('-14:00'));

		if (compareNormalizedDateTime(normalizedThisMax, normalizedOther) < 0) {
			return -1;
		}

		if (compareNormalizedDateTime(normalizedThisMin, normalizedOther) > 0) {
			return 1;
		}

		return undefined;
	}

	toString () {
		switch (this._type) {
			case 'xs:dateTime':
				return convertYearToString(this._years) + '-' +
					convertToTwoCharString(this._months) + '-' +
					convertToTwoCharString(this._days) + 'T' +
					convertToTwoCharString(this._hours) + ':' +
					convertToTwoCharString(this._minutes) + ':' +
					convertSecondsToString(this._seconds + this._secondFraction) +
					(this._timezone ? timezoneToString(this._timezone) : '');
			case 'xs:date':
				return convertYearToString(this._years) + '-' +
					convertToTwoCharString(this._months) + '-' +
					convertToTwoCharString(this._days) +
					(this._timezone ? timezoneToString(this._timezone) : '');
			case 'xs:time':
				return convertToTwoCharString(this._hours) + ':' +
					convertToTwoCharString(this._minutes) + ':' +
					convertSecondsToString(this._seconds + this._secondFraction) +
					(this._timezone ? timezoneToString(this._timezone) : '');
			case 'xs:gDay':
				return '---' +
					convertToTwoCharString(this._days) +
					(this._timezone ? timezoneToString(this._timezone) : '');
			case 'xs:gMonth':
				return '--' +
					convertToTwoCharString(this._months) +
					(this._timezone ? timezoneToString(this._timezone) : '');
			case 'xs:gMonthDay':
				return '--' +
					convertToTwoCharString(this._months) + '-' +
					convertToTwoCharString(this._days) +
					(this._timezone ? timezoneToString(this._timezone) : '');
			case 'xs:gYear':
				return convertYearToString(this._years) +
					(this._timezone ? timezoneToString(this._timezone) : '');
			case 'xs:gYearMonth':
				return convertYearToString(this._years) + '-' +
					convertToTwoCharString(this._months) +
					(this._timezone ? timezoneToString(this._timezone) : '');
		}
		throw new Error('Unexpected subType');
	}

	convertToType (type) {
		// xs:date       xxxx-xx-xxT00:00:00
		// xs:time       1972-12-31Txx:xx:xx
		// xs:gYearMonth xxxx-xx-01T00:00:00
		// xs:gYear      xxxx-01-01T00:00:00
		// xs:gMonthDay  1972-xx-xxT00:00:00
		// xs:gMonth     1972-xx-01T00:00:00
		// xs:gDay       1972-12-xxT00:00:00

		switch (type) {
			case 'xs:gDay':
				return new DateTime(1972, 12, this._days, 0, 0, 0, 0, this._timezone, 'xs:gDay');
			case 'xs:gMonth':
				return new DateTime(1972, this._months, 1, 0, 0, 0, 0, this._timezone, 'xs:gMonth');
			case 'xs:gYear':
				return new DateTime(this._years, 1, 1, 0, 0, 0, 0, this._timezone, 'xs:gYear');
			case 'xs:gMonthDay':
				return new DateTime(1972, this._months, this._days, 0, 0, 0, 0, this._timezone, 'xs:gMonthDay');
			case 'xs:gYearMonth':
				return new DateTime(this._years, this._months, 1, 0, 0, 0, 0, this._timezone, 'xs:gYearMonth');
			case 'xs:time':
				return new DateTime(1972, 12, 31, this._hours, this._minutes, this._seconds, this._secondFraction, this._timezone, 'xs:time');
			case 'xs:date':
				return new DateTime(this._years, this._months, this._days, 0, 0, 0, 0, this._timezone, 'xs:date');
			case 'xs:dateTime':
			default:
				return new DateTime(this._years, this._months, this._days, this._hours, this._minutes, this._seconds, this._secondFraction, this._timezone, 'xs:dateTime');
		}
	}
}

// dateTime    | (-)yyyy-mm-ddThh:mm:ss.ss(Z|[+-]hh:mm)
// time        |               hh:mm:ss.ss(Z|[+-]hh:mm)
// date        | (-)yyyy-mm-dd            (Z|[+-]hh:mm)
// gYearMonth  | (-)yyyy-mm               (Z|[+-]hh:mm)
// gYear       | (-)yyyy                  (Z|[+-]hh:mm)
// gMonthDay   |       --mm-dd            (Z|[+-]hh:mm)
// gDay        |         ---dd            (Z|[+-]hh:mm)
// gMonth      |       --mm               (Z|[+-]hh:mm)
/**
 * @static
 * @param   {string}    string
 * @return  {DateTime}
 */
DateTime.fromString = function (string) {
	const regex = /^(?:(-?\d{4,}))?(?:--?(\d\d))?(?:-{1,3}(\d\d))?(T)?(?:(\d\d):(\d\d):(\d\d))?(\.\d+)?(Z|(?:[+-]\d\d:\d\d))?$/;
	const match = regex.exec(string);

	const years = match[1] ? parseInt(match[1], 10) : null;
	const months = parseMatch(match[2]);
	const days = parseMatch(match[3]);
	const t = match[4];
	const hours = parseMatch(match[5]);
	const minutes = parseMatch(match[6]);
	const seconds = parseMatch(match[7]);
	const secondFraction = match[8] ? parseFloat(match[8]) : 0;
	const timezone = match[9] ? DayTimeDuration.fromTimezoneString(match[9]) : null;

	if (years && (years < -271821 || years > 273860)) {
		// These are the JavaScript bounds for date (https://tc39.github.io/ecma262/#sec-time-values-and-time-range)
		throw new Error('FODT0001: Datetime year is out of bounds');
	}

	if (t) {
		// There is a T separating the date and time components -> dateTime
		return new DateTime(
			years,
			months,
			days,
			hours,
			minutes,
			seconds,
			secondFraction,
			timezone,
			'xs:dateTime');
	}

	if (hours !== null && minutes !== null && seconds !== null) {
		// There is no T separator, but there is a time component -> time
		return new DateTime(
			1972,
			12,
			31,
			hours,
			minutes,
			seconds,
			secondFraction,
			timezone,
			'xs:time');
	}

	if (years !== null && months !== null && days !== null) {
		// There is no T separator, but there is a complete date component -> date
		return new DateTime(
			years,
			months,
			days,
			0,
			0,
			0,
			0,
			timezone,
			'xs:date');
	}

	if (years !== null && months !== null) {
		// There is no complete date component, but there is a year and a month -> gYearMonth
		return new DateTime(
			years,
			months,
			1,
			0,
			0,
			0,
			0,
			timezone,
			'xs:gYearMonth');
	}

	if (months !== null && days !== null) {
		// There is no complete date component, but there is a month and a day -> gMonthDay
		return new DateTime(
			1972,
			months,
			days,
			0,
			0,
			0,
			0,
			timezone,
			'xs:gMonthDay');
	}

	if (years !== null) {
		// There is only a year -> gYear
		return new DateTime(
			years,
			1,
			1,
			0,
			0,
			0,
			0,
			timezone,
			'xs:gYear');
	}

	if (months !== null) {
		// There is only a month -> gMonth
		return new DateTime(
			1972,
			months,
			1,
			0,
			0,
			0,
			0,
			timezone,
			'xs:gMonth');
	}

	// There is only one option left -> gDay
	return new DateTime(
		1972,
		12,
		days,
		0,
		0,
		0,
		0,
		timezone,
		'xs:gDay');
};

/**
 * @param   {DateTime}   dateTime1
 * @param   {DateTime}   dateTime2
 * @param   {?DayTimeDuration}  implicitTimezone
 * @return  {boolean}
 */
export function equal (dateTime1, dateTime2, implicitTimezone = undefined) {
	if (dateTime1._type !== dateTime2._type) {
		return false;
	}

	if (dateTime1.toJavaScriptDate(implicitTimezone).getTime() === dateTime2.toJavaScriptDate(implicitTimezone).getTime()) {
		// We should break the tie on the secondFraction property, which has no counterpart in JS dates
		return dateTime1._secondFraction === dateTime2._secondFraction;
	}
	return false;
}

/**
 * @param   {DateTime}   dateTime1
 * @param   {DateTime}   dateTime2
 * @param   {?DayTimeDuration}  implicitTimezone
 * @return  {boolean}
 */
export function lessThan (dateTime1, dateTime2, implicitTimezone = undefined) {
	if (dateTime1.toJavaScriptDate(implicitTimezone).getTime() === dateTime2.toJavaScriptDate(implicitTimezone).getTime()) {
		// We should break the tie on the secondFraction property, which has no counterpart in JS dates
		return dateTime1._secondFraction < dateTime2._secondFraction;
	}
	return dateTime1.toJavaScriptDate(implicitTimezone) < dateTime2.toJavaScriptDate(implicitTimezone);
}

/**
 * @param   {DateTime}   dateTime1
 * @param   {DateTime}   dateTime2
 * @param   {?DayTimeDuration}  implicitTimezone
 * @return  {boolean}
 */
export function greaterThan (dateTime1, dateTime2, implicitTimezone = undefined) {
		if (dateTime1.toJavaScriptDate(implicitTimezone).getTime() === dateTime2.toJavaScriptDate(implicitTimezone).getTime()) {
		// We should break the tie on the secondFraction property, which has no counterpart in JS dates
		return dateTime1._secondFraction > dateTime2._secondFraction;
	}
	return dateTime1.toJavaScriptDate(implicitTimezone) > dateTime2.toJavaScriptDate(implicitTimezone);
}

export function subtract (dateTime1, dateTime2, implicitTimezone = undefined) {
	// Divided by 1000 because date subtraction results in milliseconds
	const secondsOfDuration = (dateTime1.toJavaScriptDate(implicitTimezone) - dateTime2.toJavaScriptDate(implicitTimezone)) / 1000;
	return new DayTimeDuration(
secondsOfDuration
	);
}

export default DateTime;
