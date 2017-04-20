import Timezone from './Timezone';

/**
 * @param   {string|undefined}  match
 * @return  {number|null}
 */
function parseMatch (match) {
	return match ? parseInt(match, 10) : null;
}

// Helper function to compare two normalized dateTimes
function compareNormalizedDateTime (dateTime1, dateTime2) {
	const fields = [
		[dateTime1._years, dateTime2._years],
		[dateTime1._months, dateTime2._months],
		[dateTime1._days, dateTime2._days],
		[dateTime1._hours, dateTime2._hours],
		[dateTime1._minutes, dateTime2._minutes],
		[dateTime1._seconds, dateTime2._seconds],
		[dateTime1._secondFraction, dateTime2._secondFraction]
	];

	for (let i = 0; i < 7; i++) {
		if (fields[i][0] > fields[i][1]) {
			return 1;
		}
		if (fields[i][0] < fields[i][1]) {
			return -1;
		}
	}

	return 0;
}
function convertYearToString (year) {
	let string = year + '';
	switch (string.length) {
		case 1:
			string = '000' + string;
			break;
		case 2:
			string = '00' + string;
			break;
		case 3:
			string = '0' + string;
			break;
	}
	return string;
}

function convertToTwoCharString (value) {
	const string = value + '';
	return string.padStart(2, '0');
}

function convertSecondsToString (seconds) {
	let string = seconds + '';
	if (string.split('.')[0].length === 1) {
		string = string.padStart(string.length + 1, '0');
	}
	return string;
}

class DateTime {
	constructor (years, months, days, hours, minutes, seconds, secondFraction, timezone, isPositive, type = 'xs:dateTime') {
		this._years = years;
		this._months = months;
		this._days = days;
		this._hours = hours;
		this._minutes = minutes;
		this._seconds = seconds;
		this._secondFraction = secondFraction;
		this._timezone = timezone; // TODO: convert to dayTimeDuration
		this._isPositive = isPositive;
		this._type = type;
	}

	normalize (timezone = undefined) {
		if (timezone === undefined && (this._timezone === null || this._timezone.isUTC())) {
			// Noting to normalize
			return this;
		}

		const timezoneToUse = timezone ? timezone : this._timezone;

		const timezoneHours = timezoneToUse.getHours();
		const timezoneMinutes = timezoneToUse.getMinutes();
		let newDateTime;

		if (timezoneToUse.isPositive()) {
			newDateTime = new Date(this._years, this._months - 1, this._days, this._hours - timezoneHours, this._minutes - timezoneMinutes);
		}
		else {
			newDateTime = new Date(this._years, this._months - 1, this._days, this._hours + timezoneHours, this._minutes + timezoneMinutes);
		}

		const years = newDateTime.getFullYear();
		const months = newDateTime.getMonth() + 1;
		const days = newDateTime.getDate();
		const hours = newDateTime.getHours();
		const minutes = newDateTime.getMinutes();

		return new DateTime(years, months, days, hours, minutes, this._seconds, this._secondFraction, Timezone.fromString('Z'), this._isPositive);
	}

	// returns -1 if this < other, 0 if this === other, 1 if this > other, undefined if indeterminate
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
			const normalizedOtherMin = other.normalize(Timezone.fromString('+14:00'));
			const normalizedOtherMax = other.normalize(Timezone.fromString('-14:00'));

			if (compareNormalizedDateTime(normalizedThis, normalizedOtherMin) < 0) {
				return -1;
			}

			if (compareNormalizedDateTime(normalizedThis, normalizedOtherMax) > 0) {
				return 1;
			}

			return undefined;
		}

		// If only other has a timezone
		const normalizedThisMin = this.normalize(Timezone.fromString('+14:00'));
		const normalizedThisMax = this.normalize(Timezone.fromString('-14:00'));

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
				return (this._isPositive ? '' : '-') +
					convertYearToString(this._years) + '-' +
					convertToTwoCharString(this._months) + '-' +
					convertToTwoCharString(this._days) + 'T' +
					convertToTwoCharString(this._hours) + ':' +
					convertToTwoCharString(this._minutes) + ':' +
					convertSecondsToString(this._seconds + this._secondFraction) +
					(this._timezone ? this._timezone.toString() : '');
			case 'xs:date':
				return (this._isPositive ? '' : '-') +
					convertYearToString(this._years) + '-' +
					convertToTwoCharString(this._months) + '-' +
					convertToTwoCharString(this._days) +
					(this._timezone ? this._timezone.toString() : '');
			case 'xs:time':
				return convertToTwoCharString(this._hours) + ':' +
					convertToTwoCharString(this._minutes) + ':' +
					convertSecondsToString(this._seconds + this._secondFraction) +
					(this._timezone ? this._timezone.toString() : '');
			case 'xs:gDay':
				return '---' +
					convertToTwoCharString(this._days) +
					(this._timezone ? this._timezone.toString() : '');
			case 'xs:gMonth':
				return '--' +
					convertToTwoCharString(this._months) +
					(this._timezone ? this._timezone.toString() : '');
			case 'xs:gMonthDay':
				return '--' +
					convertToTwoCharString(this._months) + '-' +
					convertToTwoCharString(this._days) +
					(this._timezone ? this._timezone.toString() : '');
			case 'xs:gYear':
				return (this._isPositive ? '' : '-') +
					convertYearToString(this._years) +
					(this._timezone ? this._timezone.toString() : '');
			case 'xs:gYearMonth':
				return (this._isPositive ? '' : '-') +
					convertYearToString(this._years) + '-' +
					convertToTwoCharString(this._months) +
					(this._timezone ? this._timezone.toString() : '');
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
				this._isPositive = true;
				this._type = 'xs:gDay';
				break;
			case 'xs:gMonth':
				this._years = 0;
				this._days = 0;
				this._hours = 0;
				this._minutes = 0;
				this._seconds = 0;
				this._secondFraction = 0;
				this._isPositive = true;
				this._type = 'xs:gMonth';
				break;
			case 'xs:gYear':
				this._months = 0;
				this._days = 0;
				this._hours = 0;
				this._minutes = 0;
				this._seconds = 0;
				this._secondFraction = 0;
				this._isPositive = true;
				this._type = 'xs:gYear';
				break;
			case 'xs:gMonthDay':
				this._years = 0;
				this._hours = 0;
				this._minutes = 0;
				this._seconds = 0;
				this._secondFraction = 0;
				this._isPositive = true;
				this._type = 'xs:gMonthDay';
				break;
			case 'xs:gYearMonth':
				this._days = 0;
				this._hours = 0;
				this._minutes = 0;
				this._seconds = 0;
				this._secondFraction = 0;
				this._isPositive = true;
				this._type = 'xs:gYearMonth';
				break;
			case 'xs:time':
				this._years = 0;
				this._months = 0;
				this._days = 0;
				this._isPositive = true;
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

	const isPositive = !match[1];
	const years = parseMatch(match[2]);
	const months = parseMatch(match[3]);
	const days = parseMatch(match[4]);
	const t = match[5];
	const hours = parseMatch(match[6]);
	const minutes = parseMatch(match[7]);
	const seconds = parseMatch(match[8]);
	const secondFraction = match[9] ? parseFloat(match[9]) : 0;
	const timezone = match[10] ? Timezone.fromString(match[10]) : null;

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
			isPositive,
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
			true,
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
			isPositive,
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
			isPositive,
			'xs:gYearMonth');
	}

	if (!isPositive && months !== null && days !== null) {
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
			true,
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
			isPositive,
			'xs:gYear');
	}

	if (!isPositive && months !== null) {
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
			true,
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
		true,
		'xs:gDay');
};

export default DateTime;
