import AbstractDuration from './AbstractDuration';
import DayTimeDuration from './DayTimeDuration';

function parseMatch(match: string | undefined): number | null {
	return match ? parseInt(match, 10) : null;
}

function convertYearToString(year: number): string {
	let string = year + '';
	const isNegative = string.startsWith('-');
	if (isNegative) {
		string = string.substring(1);
	}
	return (isNegative ? '-' : '') + string.padStart(4, '0');
}

function convertToTwoCharString(value: number): string {
	const string = value + '';
	return string.padStart(2, '0');
}

function convertSecondsToString(seconds: number): string {
	let string = seconds + '';
	if (string.split('.')[0].length === 1) {
		string = string.padStart(string.length + 1, '0');
	}
	return string;
}

function isUTC(timezone: DayTimeDuration): boolean {
	return timezone.getHours() === 0 && timezone.getMinutes() === 0;
}

function timezoneToString(timezone: DayTimeDuration): string {
	if (isUTC(timezone)) {
		return 'Z';
	}

	return (
		(timezone.isPositive() ? '+' : '-') +
		convertToTwoCharString(Math.abs(timezone.getHours())) +
		':' +
		convertToTwoCharString(Math.abs(timezone.getMinutes()))
	);
}

class DateTime {
	public static fromString: (string: any) => DateTime;
	private _days: number;
	private _hours: number;
	private _minutes: number;
	private _months: number;
	private _secondFraction: number;
	private _seconds: number;
	private _timezone: DayTimeDuration;
	private _type: string;
	private _years: number;
	constructor(
		years: number,
		months: number,
		days: number,
		hours: number,
		minutes: number,
		seconds: number,
		secondFraction: number,
		timezone: DayTimeDuration,
		type = 'xs:dateTime'
	) {
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

	public convertToType(type) {
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
				return new DateTime(
					1972,
					this._months,
					this._days,
					0,
					0,
					0,
					0,
					this._timezone,
					'xs:gMonthDay'
				);
			case 'xs:gYearMonth':
				return new DateTime(
					this._years,
					this._months,
					1,
					0,
					0,
					0,
					0,
					this._timezone,
					'xs:gYearMonth'
				);
			case 'xs:time':
				return new DateTime(
					1972,
					12,
					31,
					this._hours,
					this._minutes,
					this._seconds,
					this._secondFraction,
					this._timezone,
					'xs:time'
				);
			case 'xs:date':
				return new DateTime(
					this._years,
					this._months,
					this._days,
					0,
					0,
					0,
					0,
					this._timezone,
					'xs:date'
				);
			case 'xs:dateTime':
			default:
				return new DateTime(
					this._years,
					this._months,
					this._days,
					this._hours,
					this._minutes,
					this._seconds,
					this._secondFraction,
					this._timezone,
					'xs:dateTime'
				);
		}
	}

	public getDay() {
		return this._days;
	}

	public getFullSeconds() {
		return this._seconds + this._secondFraction;
	}

	public getHours() {
		return this._hours;
	}

	public getMinutes() {
		return this._minutes;
	}

	public getMonth() {
		return this._months;
	}

	public getSecondFraction() {
		return this._secondFraction;
	}

	public getSeconds() {
		return this._seconds;
	}

	public getTimezone() {
		return this._timezone;
	}

	public getYear() {
		return this._years;
	}

	public isPositive() {
		return this._years >= 0;
	}

	public toJavaScriptDate(implicitTimezone = undefined): Date {
		const timezoneToUse =
			this._timezone || implicitTimezone || DayTimeDuration.fromTimezoneString('Z');
		return new Date(
			Date.UTC(
				this._years,
				this._months - 1,
				this._days,
				this._hours - timezoneToUse.getHours(),
				this._minutes - timezoneToUse.getMinutes(),
				this._seconds + this._secondFraction
			)
		);
	}

	public toString() {
		switch (this._type) {
			case 'xs:dateTime':
				return (
					convertYearToString(this._years) +
					'-' +
					convertToTwoCharString(this._months) +
					'-' +
					convertToTwoCharString(this._days) +
					'T' +
					convertToTwoCharString(this._hours) +
					':' +
					convertToTwoCharString(this._minutes) +
					':' +
					convertSecondsToString(this._seconds + this._secondFraction) +
					(this._timezone ? timezoneToString(this._timezone) : '')
				);
			case 'xs:date':
				return (
					convertYearToString(this._years) +
					'-' +
					convertToTwoCharString(this._months) +
					'-' +
					convertToTwoCharString(this._days) +
					(this._timezone ? timezoneToString(this._timezone) : '')
				);
			case 'xs:time':
				return (
					convertToTwoCharString(this._hours) +
					':' +
					convertToTwoCharString(this._minutes) +
					':' +
					convertSecondsToString(this._seconds + this._secondFraction) +
					(this._timezone ? timezoneToString(this._timezone) : '')
				);
			case 'xs:gDay':
				return (
					'---' +
					convertToTwoCharString(this._days) +
					(this._timezone ? timezoneToString(this._timezone) : '')
				);
			case 'xs:gMonth':
				return (
					'--' +
					convertToTwoCharString(this._months) +
					(this._timezone ? timezoneToString(this._timezone) : '')
				);
			case 'xs:gMonthDay':
				return (
					'--' +
					convertToTwoCharString(this._months) +
					'-' +
					convertToTwoCharString(this._days) +
					(this._timezone ? timezoneToString(this._timezone) : '')
				);
			case 'xs:gYear':
				return (
					convertYearToString(this._years) +
					(this._timezone ? timezoneToString(this._timezone) : '')
				);
			case 'xs:gYearMonth':
				return (
					convertYearToString(this._years) +
					'-' +
					convertToTwoCharString(this._months) +
					(this._timezone ? timezoneToString(this._timezone) : '')
				);
		}
		throw new Error('Unexpected subType');
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
DateTime.fromString = function(string: string): DateTime {
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
			'xs:dateTime'
		);
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
			'xs:time'
		);
	}

	if (years !== null && months !== null && days !== null) {
		// There is no T separator, but there is a complete date component -> date
		return new DateTime(years, months, days, 0, 0, 0, 0, timezone, 'xs:date');
	}

	if (years !== null && months !== null) {
		// There is no complete date component, but there is a year and a month -> gYearMonth
		return new DateTime(years, months, 1, 0, 0, 0, 0, timezone, 'xs:gYearMonth');
	}

	if (months !== null && days !== null) {
		// There is no complete date component, but there is a month and a day -> gMonthDay
		return new DateTime(1972, months, days, 0, 0, 0, 0, timezone, 'xs:gMonthDay');
	}

	if (years !== null) {
		// There is only a year -> gYear
		return new DateTime(years, 1, 1, 0, 0, 0, 0, timezone, 'xs:gYear');
	}

	if (months !== null) {
		// There is only a month -> gMonth
		return new DateTime(1972, months, 1, 0, 0, 0, 0, timezone, 'xs:gMonth');
	}

	// There is only one option left -> gDay
	return new DateTime(1972, 12, days, 0, 0, 0, 0, timezone, 'xs:gDay');
};

export function compare(
	dateTime1: DateTime,
	dateTime2: DateTime,
	implicitTimezone: DayTimeDuration | null = undefined
): number {
	const jsTime1 = dateTime1.toJavaScriptDate(implicitTimezone).getTime();
	const jsTime2 = dateTime2.toJavaScriptDate(implicitTimezone).getTime();

	if (jsTime1 === jsTime2) {
		// We should break the tie on the secondFraction property, which has no counterpart in JS dates
		if (dateTime1._secondFraction === dateTime2._secondFraction) {
			return 0;
		}
		if (dateTime1._secondFraction > dateTime2._secondFraction) {
			return 1;
		}
		return -1;
	}

	if (jsTime1 > jsTime2) {
		return 1;
	}

	return -1;
}

export function equal(
	dateTime1: DateTime,
	dateTime2: DateTime,
	implicitTimezone: DayTimeDuration | null = undefined
): boolean {
	return compare(dateTime1, dateTime2, implicitTimezone) === 0;
}

export function lessThan(
	dateTime1: DateTime,
	dateTime2: DateTime,
	implicitTimezone: DayTimeDuration | null = undefined
): boolean {
	return compare(dateTime1, dateTime2, implicitTimezone) < 0;
}

export function greaterThan(
	dateTime1: DateTime,
	dateTime2: DateTime,
	implicitTimezone: DayTimeDuration | null = undefined
): boolean {
	return compare(dateTime1, dateTime2, implicitTimezone) > 0;
}

export function subtract(
	dateTime1: DateTime,
	dateTime2: DateTime,
	implicitTimezone: DayTimeDuration | null = undefined
): DayTimeDuration {
	// Divided by 1000 because date subtraction results in milliseconds
	const secondsOfDuration =
		(dateTime1.toJavaScriptDate(implicitTimezone).getTime() -
			dateTime2.toJavaScriptDate(implicitTimezone).getTime()) /
		1000;
	return new DayTimeDuration(secondsOfDuration);
}

export function addDuration(dateTime: DateTime, _duration: AbstractDuration): DateTime {
	throw new Error(`Not implemented: adding durations to ${dateTime._type}`);
}

export function subtractDuration(dateTime: DateTime, _duration: AbstractDuration): DateTime {
	throw new Error(`Not implemented: subtracting durations from ${dateTime._type}`);
}

export default DateTime;
