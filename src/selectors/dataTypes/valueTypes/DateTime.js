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

	clone () {
		return new DateTime(
			this._years,
			this._months,
			this._days,
			this._hours,
			this._minutes,
			this._seconds,
			this._secondFraction,
			this._timezone,
			this._type);
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

	normalize (timezone = undefined) {
		if (timezone === undefined && (this._timezone === null || isUTC(this._timezone))) {
			// Noting to normalize
			return this;
		}

		const timezoneToUse = timezone ? timezone : this._timezone;
		const newDateTime = new Date(this._years, this._months - 1, this._days, this._hours - timezoneToUse.getHours(), this._minutes - timezoneToUse.getMinutes());

		const years = newDateTime.getFullYear();
		const months = newDateTime.getMonth() + 1;
		const days = newDateTime.getDate();
		const hours = newDateTime.getHours();
		const minutes = newDateTime.getMinutes();

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
		switch (type) {
			case 'xs:gDay':
				this._years = 0;
				this._months = 0;
				this._hours = 0;
				this._minutes = 0;
				this._seconds = 0;
				this._secondFraction = 0;
				this._type = 'xs:gDay';
				break;
			case 'xs:gMonth':
				this._years = 0;
				this._days = 0;
				this._hours = 0;
				this._minutes = 0;
				this._seconds = 0;
				this._secondFraction = 0;
				this._type = 'xs:gMonth';
				break;
			case 'xs:gYear':
				this._months = 0;
				this._days = 0;
				this._hours = 0;
				this._minutes = 0;
				this._seconds = 0;
				this._secondFraction = 0;
				this._type = 'xs:gYear';
				break;
			case 'xs:gMonthDay':
				this._years = 0;
				this._hours = 0;
				this._minutes = 0;
				this._seconds = 0;
				this._secondFraction = 0;
				this._type = 'xs:gMonthDay';
				break;
			case 'xs:gYearMonth':
				this._days = 0;
				this._hours = 0;
				this._minutes = 0;
				this._seconds = 0;
				this._secondFraction = 0;
				this._type = 'xs:gYearMonth';
				break;
			case 'xs:time':
				this._years = 0;
				this._months = 0;
				this._days = 0;
				this._type = 'xs:time';
				break;
			case 'xs:date':
				this._hours = 0;
				this._minutes = 0;
				this._seconds = 0;
				this._secondFraction = 0;
				this._type = 'xs:date';
				break;
			case 'xs:dateTime':
			default:
				this._type = 'xs:dateTime';
		}
		return this;
	}
}

/**
 * @static
 * @param   {DateTime}   dateTime1
 * @param   {DateTime}   dateTime2
 * @param   {?DayTimeDuration}  implicitTimezone
 * @return  {boolean}
 */
DateTime.equal = function (dateTime1, dateTime2, implicitTimezone = undefined) {
	const normalizedDateTime1 = dateTime1.normalize(dateTime1.getTimezone() ? undefined : implicitTimezone);
	const normalizedDateTime2 = dateTime2.normalize(dateTime2.getTimezone() ? undefined : implicitTimezone);

	return compareNormalizedDateTime(normalizedDateTime1, normalizedDateTime2) === 0;
};

/**
 * @static
 * @param   {DateTime}   dateTime1
 * @param   {DateTime}   dateTime2
 * @param   {?DayTimeDuration}  implicitTimezone
 * @return  {boolean}
 */
DateTime.lessThan = function (dateTime1, dateTime2, implicitTimezone = undefined) {
	const normalizedDateTime1 = dateTime1.normalize(dateTime1.getTimezone() ? undefined : implicitTimezone);
	const normalizedDateTime2 = dateTime2.normalize(dateTime2.getTimezone() ? undefined : implicitTimezone);

	return compareNormalizedDateTime(normalizedDateTime1, normalizedDateTime2) === -1;
};

/**
 * @static
 * @param   {DateTime}   dateTime1
 * @param   {DateTime}   dateTime2
 * @param   {?DayTimeDuration}  implicitTimezone
 * @return  {boolean}
 */
DateTime.greaterThan = function (dateTime1, dateTime2, implicitTimezone = undefined) {
	const normalizedDateTime1 = dateTime1.normalize(dateTime1.getTimezone() ? undefined : implicitTimezone);
	const normalizedDateTime2 = dateTime2.normalize(dateTime2.getTimezone() ? undefined : implicitTimezone);

	return compareNormalizedDateTime(normalizedDateTime1, normalizedDateTime2) === 1;
};


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
	const regex = /(-)?(\d{4,})?(?:-(\d\d))?(?:-{1,2}(\d\d))?(T)?(?:(\d\d):(\d\d):(\d\d))?(\.\d+)?(Z|(?:[+-]\d\d:\d\d))?/;
	const match = regex.exec(string);

	const isNegative = !!match[1];
	const years = match[2] ? parseInt((isNegative ? '-' : '') + match[2], 10) : null;
	const months = parseMatch(match[3]);
	const days = parseMatch(match[4]);
	const t = match[5];
	const hours = parseMatch(match[6]);
	const minutes = parseMatch(match[7]);
	const seconds = parseMatch(match[8]);
	const secondFraction = match[9] ? parseFloat(match[9]) : 0;
	const timezone = match[10] ? DayTimeDuration.fromTimezoneString(match[10]) : null;

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
			0,
			0,
			0,
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
			0,
			0,
			0,
			0,
			0,
			timezone,
			'xs:gYearMonth');
	}

	if (isNegative && months !== null && days !== null) {
		// There is no complete date component, but there is a month and a day -> gMonthDay
		return new DateTime(
			0,
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
			0,
			0,
			0,
			0,
			0,
			0,
			timezone,
			'xs:gYear');
	}

	if (isNegative && months !== null) {
		// There is only a month -> gMonth
		return new DateTime(
			0,
			months,
			0,
			0,
			0,
			0,
			0,
			timezone,
			'xs:gMonth');
	}

	// There is only one option left -> gDay
	return new DateTime(
		0,
		0,
		days,
		0,
		0,
		0,
		0,
		timezone,
		'xs:gDay');
};

export default DateTime;
