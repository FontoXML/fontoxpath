"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DayTimeDuration_1 = require("./DayTimeDuration");
/**
 * @param   {string|undefined}  match
 * @return  {number|null}
 */
function parseMatch(match) {
    return match ? parseInt(match, 10) : null;
}
/**
 * @param   {number}  year
 * @return  {string}
 */
function convertYearToString(year) {
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
function convertToTwoCharString(value) {
    const string = value + '';
    return string.padStart(2, '0');
}
/**
 * @param   {number}  seconds
 * @return  {string}
 */
function convertSecondsToString(seconds) {
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
function isUTC(timezone) {
    return timezone.getHours() === 0 && timezone.getMinutes() === 0;
}
/**
 * @param   {DayTimeDuration} timezone
 * @return  {string}
 */
function timezoneToString(timezone) {
    if (isUTC(timezone)) {
        return 'Z';
    }
    return (timezone.isPositive() ? '+' : '-') +
        convertToTwoCharString(Math.abs(timezone.getHours())) + ':' +
        convertToTwoCharString(Math.abs(timezone.getMinutes()));
}
class DateTime {
    constructor(years, months, days, hours, minutes, seconds, secondFraction, timezone, type = 'xs:dateTime') {
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
    getYear() {
        return this._years;
    }
    getMonth() {
        return this._months;
    }
    getDay() {
        return this._days;
    }
    getHours() {
        return this._hours;
    }
    getMinutes() {
        return this._minutes;
    }
    getSeconds() {
        return this._seconds;
    }
    getFullSeconds() {
        return this._seconds + this._secondFraction;
    }
    getSecondFraction() {
        return this._secondFraction;
    }
    getTimezone() {
        return this._timezone;
    }
    isPositive() {
        return this._years >= 0;
    }
    toJavaScriptDate(implicitTimezone = undefined) {
        const timezoneToUse = this._timezone || implicitTimezone || DayTimeDuration_1.default.fromTimezoneString('Z');
        return new Date(Date.UTC(this._years, this._months - 1, this._days, this._hours - timezoneToUse.getHours(), this._minutes - timezoneToUse.getMinutes(), this._seconds + this._secondFraction));
    }
    toString() {
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
    convertToType(type) {
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
    const timezone = match[9] ? DayTimeDuration_1.default.fromTimezoneString(match[9]) : null;
    if (years && (years < -271821 || years > 273860)) {
        // These are the JavaScript bounds for date (https://tc39.github.io/ecma262/#sec-time-values-and-time-range)
        throw new Error('FODT0001: Datetime year is out of bounds');
    }
    if (t) {
        // There is a T separating the date and time components -> dateTime
        return new DateTime(years, months, days, hours, minutes, seconds, secondFraction, timezone, 'xs:dateTime');
    }
    if (hours !== null && minutes !== null && seconds !== null) {
        // There is no T separator, but there is a time component -> time
        return new DateTime(1972, 12, 31, hours, minutes, seconds, secondFraction, timezone, 'xs:time');
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
/**
 * @param   {DateTime}   dateTime1
 * @param   {DateTime}   dateTime2
 * @param   {?DayTimeDuration}  implicitTimezone
 * @return  {number}
 */
function compare(dateTime1, dateTime2, implicitTimezone = undefined) {
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
exports.compare = compare;
/**
 * @param   {DateTime}   dateTime1
 * @param   {DateTime}   dateTime2
 * @param   {?DayTimeDuration}  implicitTimezone
 * @return  {boolean}
 */
function equal(dateTime1, dateTime2, implicitTimezone = undefined) {
    return compare(dateTime1, dateTime2, implicitTimezone) === 0;
}
exports.equal = equal;
/**
 * @param   {DateTime}   dateTime1
 * @param   {DateTime}   dateTime2
 * @param   {?DayTimeDuration}  implicitTimezone
 * @return  {boolean}
 */
function lessThan(dateTime1, dateTime2, implicitTimezone = undefined) {
    return compare(dateTime1, dateTime2, implicitTimezone) < 0;
}
exports.lessThan = lessThan;
/**
 * @param   {DateTime}   dateTime1
 * @param   {DateTime}   dateTime2
 * @param   {?DayTimeDuration}  implicitTimezone
 * @return  {boolean}
 */
function greaterThan(dateTime1, dateTime2, implicitTimezone = undefined) {
    return compare(dateTime1, dateTime2, implicitTimezone) > 0;
}
exports.greaterThan = greaterThan;
/**
 * @param   {DateTime}   dateTime1
 * @param   {DateTime}   dateTime2
 * @param   {?DayTimeDuration}  implicitTimezone
 * @return  {DayTimeDuration}
 */
function add(dateTime1, dateTime2, implicitTimezone = undefined) {
    // Divided by 1000 because date subtraction results in milliseconds
    const secondsOfDuration = (dateTime1.toJavaScriptDate(implicitTimezone) + dateTime2.toJavaScriptDate(implicitTimezone)) / 1000;
    return new DayTimeDuration_1.default(secondsOfDuration);
}
exports.add = add;
/**
 * @param   {DateTime}   dateTime1
 * @param   {DateTime}   dateTime2
 * @param   {?DayTimeDuration}  implicitTimezone
 * @return  {DayTimeDuration}
 */
function subtract(dateTime1, dateTime2, implicitTimezone = undefined) {
    // Divided by 1000 because date subtraction results in milliseconds
    const secondsOfDuration = (dateTime1.toJavaScriptDate(implicitTimezone) - dateTime2.toJavaScriptDate(implicitTimezone)) / 1000;
    return new DayTimeDuration_1.default(secondsOfDuration);
}
exports.subtract = subtract;
/**
 * @param   {!DateTime}   dateTime
 * @param   {!AbstractDuration}   _duration
 * @return  {!DateTime}
 */
function addDuration(dateTime, _duration) {
    throw new Error(`Not implemented: adding durations to ${dateTime._type}`);
}
exports.addDuration = addDuration;
/**
 * @param   {!DateTime}   dateTime
 * @param   {!AbstractDuration}   _duration
 * @return  {!DateTime}
 */
function subtractDuration(dateTime, _duration) {
    throw new Error(`Not implemented: subtracting durations from ${dateTime._type}`);
}
exports.subtractDuration = subtractDuration;
exports.default = DateTime;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZVRpbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEYXRlVGltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUFnRDtBQUdoRDs7O0dBR0c7QUFDSCxTQUFTLFVBQVUsQ0FBRSxLQUFLO0lBQ3pCLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDM0MsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsbUJBQW1CLENBQUUsSUFBSTtJQUNqQyxJQUFJLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUMsSUFBSSxVQUFVLEVBQUU7UUFDZixNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM3QjtJQUNELE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsc0JBQXNCLENBQUUsS0FBSztJQUNyQyxNQUFNLE1BQU0sR0FBRyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQzFCLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsc0JBQXNCLENBQUUsT0FBTztJQUN2QyxJQUFJLE1BQU0sR0FBRyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQzFCLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3RD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LEVBQUUsQ0FBQyxDQUFDO0FBQzNFLENBQUM7QUFGRCxrQ0FFQztBQUdEOzs7O0dBSUc7QUFDSCxTQUFnQixnQkFBZ0IsQ0FBRSxRQUFRLEVBQUUsU0FBUztJQUNwRCxNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUNsRixDQUFDO0FBRkQsNENBRUM7QUFFRCxrQkFBZSxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGF5VGltZUR1cmF0aW9uIGZyb20gJy4vRGF5VGltZUR1cmF0aW9uJztcbmltcG9ydCBBYnN0cmFjdER1cmF0aW9uIGZyb20gJy4vQWJzdHJhY3REdXJhdGlvbic7XG5cbi8qKlxuICogQHBhcmFtICAge3N0cmluZ3x1bmRlZmluZWR9ICBtYXRjaFxuICogQHJldHVybiAge251bWJlcnxudWxsfVxuICovXG5mdW5jdGlvbiBwYXJzZU1hdGNoIChtYXRjaCkge1xuXHRyZXR1cm4gbWF0Y2ggPyBwYXJzZUludChtYXRjaCwgMTApIDogbnVsbDtcbn1cblxuLyoqXG4gKiBAcGFyYW0gICB7bnVtYmVyfSAgeWVhclxuICogQHJldHVybiAge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gY29udmVydFllYXJUb1N0cmluZyAoeWVhcikge1xuXHRsZXQgc3RyaW5nID0geWVhciArICcnO1xuXHRjb25zdCBpc05lZ2F0aXZlID0gc3RyaW5nLnN0YXJ0c1dpdGgoJy0nKTtcblx0aWYgKGlzTmVnYXRpdmUpIHtcblx0XHRzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKDEpO1xuXHR9XG5cdHJldHVybiAoaXNOZWdhdGl2ZSA/ICctJyA6ICcnKSArIHN0cmluZy5wYWRTdGFydCg0LCAnMCcpO1xufVxuXG4vKipcbiAqIEBwYXJhbSAgIHtudW1iZXJ9ICB2YWx1ZVxuICogQHJldHVybiAge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gY29udmVydFRvVHdvQ2hhclN0cmluZyAodmFsdWUpIHtcblx0Y29uc3Qgc3RyaW5nID0gdmFsdWUgKyAnJztcblx0cmV0dXJuIHN0cmluZy5wYWRTdGFydCgyLCAnMCcpO1xufVxuXG4vKipcbiAqIEBwYXJhbSAgIHtudW1iZXJ9ICBzZWNvbmRzXG4gKiBAcmV0dXJuICB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBjb252ZXJ0U2Vjb25kc1RvU3RyaW5nIChzZWNvbmRzKSB7XG5cdGxldCBzdHJpbmcgPSBzZWNvbmRzICsgJyc7XG5cdGlmIChzdHJpbmcuc3BsaXQoJy4nKVswXS5sZW5ndGggPT09IDEpIHtcblx0XHRzdHJpbmcgPSBzdHJpbmcucGFkU3RhcnQoc3RyaW5nLmxlbmd0aCArIDEsICcwJyk7XG5cdH1cblx0cmV0dXJuIHN0cmluZztcbn1cblxuLyoqXG4gKiBAcGFyYW0gICB7RGF5VGltZUR1cmF0aW9ufSAgdGltZXpvbmVcbiAqIEByZXR1cm4gIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1VUQyAodGltZXpvbmUpIHtcblx0cmV0dXJuIHRpbWV6b25lLmdldEhvdXJzKCkgPT09IDAgJiYgdGltZXpvbmUuZ2V0TWludXRlcygpID09PSAwO1xufVxuXG4vKipcbiAqIEBwYXJhbSAgIHtEYXlUaW1lRHVyYXRpb259IHRpbWV6b25lXG4gKiBAcmV0dXJuICB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiB0aW1lem9uZVRvU3RyaW5nICh0aW1lem9uZSkge1xuXHRpZiAoaXNVVEModGltZXpvbmUpKSB7XG5cdFx0cmV0dXJuICdaJztcblx0fVxuXG5cdHJldHVybiAodGltZXpvbmUuaXNQb3NpdGl2ZSgpID8gJysnIDogJy0nKSArXG5cdFx0Y29udmVydFRvVHdvQ2hhclN0cmluZyhNYXRoLmFicyh0aW1lem9uZS5nZXRIb3VycygpKSkgKyAnOicgK1xuXHRcdGNvbnZlcnRUb1R3b0NoYXJTdHJpbmcoTWF0aC5hYnModGltZXpvbmUuZ2V0TWludXRlcygpKSk7XG59XG5cbmNsYXNzIERhdGVUaW1lIHtcblx0X3llYXJzOiBudW1iZXI7XG5cdF9tb250aHM6IG51bWJlcjtcblx0X2RheXM6IG51bWJlcjtcblx0X2hvdXJzOiBudW1iZXI7XG5cdF9taW51dGVzOiBudW1iZXI7XG5cdF9zZWNvbmRzOiBudW1iZXI7XG5cdF9zZWNvbmRGcmFjdGlvbjogbnVtYmVyO1xuXHRfdGltZXpvbmU6IG51bWJlcjtcblx0X3R5cGU6IHN0cmluZztcblx0c3RhdGljIGZyb21TdHJpbmc6IChzdHJpbmc6IGFueSkgPT4gRGF0ZVRpbWU7XG5cdGNvbnN0cnVjdG9yICh5ZWFycywgbW9udGhzLCBkYXlzLCBob3VycywgbWludXRlcywgc2Vjb25kcywgc2Vjb25kRnJhY3Rpb24sIHRpbWV6b25lLCB0eXBlID0gJ3hzOmRhdGVUaW1lJykge1xuXHRcdHRoaXMuX3llYXJzID0geWVhcnM7XG5cdFx0dGhpcy5fbW9udGhzID0gbW9udGhzO1xuXHRcdHRoaXMuX2RheXMgPSBkYXlzICsgKGhvdXJzID09PSAyNCA/IDEgOiAwKTtcblx0XHR0aGlzLl9ob3VycyA9IGhvdXJzID09PSAyNCA/IDAgOiBob3Vycztcblx0XHR0aGlzLl9taW51dGVzID0gbWludXRlcztcblx0XHR0aGlzLl9zZWNvbmRzID0gc2Vjb25kcztcblx0XHR0aGlzLl9zZWNvbmRGcmFjdGlvbiA9IHNlY29uZEZyYWN0aW9uO1xuXHRcdHRoaXMuX3RpbWV6b25lID0gdGltZXpvbmU7XG5cdFx0dGhpcy5fdHlwZSA9IHR5cGU7XG5cdH1cblxuXHRnZXRZZWFyICgpIHtcblx0XHRyZXR1cm4gdGhpcy5feWVhcnM7XG5cdH1cblxuXHRnZXRNb250aCAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX21vbnRocztcblx0fVxuXG5cdGdldERheSAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2RheXM7XG5cdH1cblxuXHRnZXRIb3VycyAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2hvdXJzO1xuXHR9XG5cblx0Z2V0TWludXRlcyAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX21pbnV0ZXM7XG5cdH1cblxuXHRnZXRTZWNvbmRzICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fc2Vjb25kcztcblx0fVxuXG5cdGdldEZ1bGxTZWNvbmRzICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fc2Vjb25kcyArIHRoaXMuX3NlY29uZEZyYWN0aW9uO1xuXHR9XG5cblx0Z2V0U2Vjb25kRnJhY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLl9zZWNvbmRGcmFjdGlvbjtcblx0fVxuXG5cdGdldFRpbWV6b25lICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fdGltZXpvbmU7XG5cdH1cblxuXHRpc1Bvc2l0aXZlICgpIHtcblx0XHRyZXR1cm4gdGhpcy5feWVhcnMgPj0gMDtcblx0fVxuXG5cdHRvSmF2YVNjcmlwdERhdGUgKGltcGxpY2l0VGltZXpvbmUgPSB1bmRlZmluZWQpIHtcblx0XHRjb25zdCB0aW1lem9uZVRvVXNlID0gdGhpcy5fdGltZXpvbmUgfHwgaW1wbGljaXRUaW1lem9uZSB8fCBEYXlUaW1lRHVyYXRpb24uZnJvbVRpbWV6b25lU3RyaW5nKCdaJyk7XG5cdFx0cmV0dXJuIG5ldyBEYXRlKERhdGUuVVRDKFxuXHRcdFx0dGhpcy5feWVhcnMsXG5cdFx0XHR0aGlzLl9tb250aHMgLSAxLFxuXHRcdFx0dGhpcy5fZGF5cyxcblx0XHRcdHRoaXMuX2hvdXJzIC0gdGltZXpvbmVUb1VzZS5nZXRIb3VycygpLFxuXHRcdFx0dGhpcy5fbWludXRlcyAtIHRpbWV6b25lVG9Vc2UuZ2V0TWludXRlcygpLFxuXHRcdFx0dGhpcy5fc2Vjb25kcyArIHRoaXMuX3NlY29uZEZyYWN0aW9uKVxuXHRcdCk7XG5cdH1cblxuXHR0b1N0cmluZyAoKSB7XG5cdFx0c3dpdGNoICh0aGlzLl90eXBlKSB7XG5cdFx0XHRjYXNlICd4czpkYXRlVGltZSc6XG5cdFx0XHRcdHJldHVybiBjb252ZXJ0WWVhclRvU3RyaW5nKHRoaXMuX3llYXJzKSArICctJyArXG5cdFx0XHRcdFx0Y29udmVydFRvVHdvQ2hhclN0cmluZyh0aGlzLl9tb250aHMpICsgJy0nICtcblx0XHRcdFx0XHRjb252ZXJ0VG9Ud29DaGFyU3RyaW5nKHRoaXMuX2RheXMpICsgJ1QnICtcblx0XHRcdFx0XHRjb252ZXJ0VG9Ud29DaGFyU3RyaW5nKHRoaXMuX2hvdXJzKSArICc6JyArXG5cdFx0XHRcdFx0Y29udmVydFRvVHdvQ2hhclN0cmluZyh0aGlzLl9taW51dGVzKSArICc6JyArXG5cdFx0XHRcdFx0Y29udmVydFNlY29uZHNUb1N0cmluZyh0aGlzLl9zZWNvbmRzICsgdGhpcy5fc2Vjb25kRnJhY3Rpb24pICtcblx0XHRcdFx0XHQodGhpcy5fdGltZXpvbmUgPyB0aW1lem9uZVRvU3RyaW5nKHRoaXMuX3RpbWV6b25lKSA6ICcnKTtcblx0XHRcdGNhc2UgJ3hzOmRhdGUnOlxuXHRcdFx0XHRyZXR1cm4gY29udmVydFllYXJUb1N0cmluZyh0aGlzLl95ZWFycykgKyAnLScgK1xuXHRcdFx0XHRcdGNvbnZlcnRUb1R3b0NoYXJTdHJpbmcodGhpcy5fbW9udGhzKSArICctJyArXG5cdFx0XHRcdFx0Y29udmVydFRvVHdvQ2hhclN0cmluZyh0aGlzLl9kYXlzKSArXG5cdFx0XHRcdFx0KHRoaXMuX3RpbWV6b25lID8gdGltZXpvbmVUb1N0cmluZyh0aGlzLl90aW1lem9uZSkgOiAnJyk7XG5cdFx0XHRjYXNlICd4czp0aW1lJzpcblx0XHRcdFx0cmV0dXJuIGNvbnZlcnRUb1R3b0NoYXJTdHJpbmcodGhpcy5faG91cnMpICsgJzonICtcblx0XHRcdFx0XHRjb252ZXJ0VG9Ud29DaGFyU3RyaW5nKHRoaXMuX21pbnV0ZXMpICsgJzonICtcblx0XHRcdFx0XHRjb252ZXJ0U2Vjb25kc1RvU3RyaW5nKHRoaXMuX3NlY29uZHMgKyB0aGlzLl9zZWNvbmRGcmFjdGlvbikgK1xuXHRcdFx0XHRcdCh0aGlzLl90aW1lem9uZSA/IHRpbWV6b25lVG9TdHJpbmcodGhpcy5fdGltZXpvbmUpIDogJycpO1xuXHRcdFx0Y2FzZSAneHM6Z0RheSc6XG5cdFx0XHRcdHJldHVybiAnLS0tJyArXG5cdFx0XHRcdFx0Y29udmVydFRvVHdvQ2hhclN0cmluZyh0aGlzLl9kYXlzKSArXG5cdFx0XHRcdFx0KHRoaXMuX3RpbWV6b25lID8gdGltZXpvbmVUb1N0cmluZyh0aGlzLl90aW1lem9uZSkgOiAnJyk7XG5cdFx0XHRjYXNlICd4czpnTW9udGgnOlxuXHRcdFx0XHRyZXR1cm4gJy0tJyArXG5cdFx0XHRcdFx0Y29udmVydFRvVHdvQ2hhclN0cmluZyh0aGlzLl9tb250aHMpICtcblx0XHRcdFx0XHQodGhpcy5fdGltZXpvbmUgPyB0aW1lem9uZVRvU3RyaW5nKHRoaXMuX3RpbWV6b25lKSA6ICcnKTtcblx0XHRcdGNhc2UgJ3hzOmdNb250aERheSc6XG5cdFx0XHRcdHJldHVybiAnLS0nICtcblx0XHRcdFx0XHRjb252ZXJ0VG9Ud29DaGFyU3RyaW5nKHRoaXMuX21vbnRocykgKyAnLScgK1xuXHRcdFx0XHRcdGNvbnZlcnRUb1R3b0NoYXJTdHJpbmcodGhpcy5fZGF5cykgK1xuXHRcdFx0XHRcdCh0aGlzLl90aW1lem9uZSA/IHRpbWV6b25lVG9TdHJpbmcodGhpcy5fdGltZXpvbmUpIDogJycpO1xuXHRcdFx0Y2FzZSAneHM6Z1llYXInOlxuXHRcdFx0XHRyZXR1cm4gY29udmVydFllYXJUb1N0cmluZyh0aGlzLl95ZWFycykgK1xuXHRcdFx0XHRcdCh0aGlzLl90aW1lem9uZSA/IHRpbWV6b25lVG9TdHJpbmcodGhpcy5fdGltZXpvbmUpIDogJycpO1xuXHRcdFx0Y2FzZSAneHM6Z1llYXJNb250aCc6XG5cdFx0XHRcdHJldHVybiBjb252ZXJ0WWVhclRvU3RyaW5nKHRoaXMuX3llYXJzKSArICctJyArXG5cdFx0XHRcdFx0Y29udmVydFRvVHdvQ2hhclN0cmluZyh0aGlzLl9tb250aHMpICtcblx0XHRcdFx0XHQodGhpcy5fdGltZXpvbmUgPyB0aW1lem9uZVRvU3RyaW5nKHRoaXMuX3RpbWV6b25lKSA6ICcnKTtcblx0XHR9XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIHN1YlR5cGUnKTtcblx0fVxuXG5cdGNvbnZlcnRUb1R5cGUgKHR5cGUpIHtcblx0XHQvLyB4czpkYXRlICAgICAgIHh4eHgteHgteHhUMDA6MDA6MDBcblx0XHQvLyB4czp0aW1lICAgICAgIDE5NzItMTItMzFUeHg6eHg6eHhcblx0XHQvLyB4czpnWWVhck1vbnRoIHh4eHgteHgtMDFUMDA6MDA6MDBcblx0XHQvLyB4czpnWWVhciAgICAgIHh4eHgtMDEtMDFUMDA6MDA6MDBcblx0XHQvLyB4czpnTW9udGhEYXkgIDE5NzIteHgteHhUMDA6MDA6MDBcblx0XHQvLyB4czpnTW9udGggICAgIDE5NzIteHgtMDFUMDA6MDA6MDBcblx0XHQvLyB4czpnRGF5ICAgICAgIDE5NzItMTIteHhUMDA6MDA6MDBcblxuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSAneHM6Z0RheSc6XG5cdFx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoMTk3MiwgMTIsIHRoaXMuX2RheXMsIDAsIDAsIDAsIDAsIHRoaXMuX3RpbWV6b25lLCAneHM6Z0RheScpO1xuXHRcdFx0Y2FzZSAneHM6Z01vbnRoJzpcblx0XHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZSgxOTcyLCB0aGlzLl9tb250aHMsIDEsIDAsIDAsIDAsIDAsIHRoaXMuX3RpbWV6b25lLCAneHM6Z01vbnRoJyk7XG5cdFx0XHRjYXNlICd4czpnWWVhcic6XG5cdFx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy5feWVhcnMsIDEsIDEsIDAsIDAsIDAsIDAsIHRoaXMuX3RpbWV6b25lLCAneHM6Z1llYXInKTtcblx0XHRcdGNhc2UgJ3hzOmdNb250aERheSc6XG5cdFx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoMTk3MiwgdGhpcy5fbW9udGhzLCB0aGlzLl9kYXlzLCAwLCAwLCAwLCAwLCB0aGlzLl90aW1lem9uZSwgJ3hzOmdNb250aERheScpO1xuXHRcdFx0Y2FzZSAneHM6Z1llYXJNb250aCc6XG5cdFx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy5feWVhcnMsIHRoaXMuX21vbnRocywgMSwgMCwgMCwgMCwgMCwgdGhpcy5fdGltZXpvbmUsICd4czpnWWVhck1vbnRoJyk7XG5cdFx0XHRjYXNlICd4czp0aW1lJzpcblx0XHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZSgxOTcyLCAxMiwgMzEsIHRoaXMuX2hvdXJzLCB0aGlzLl9taW51dGVzLCB0aGlzLl9zZWNvbmRzLCB0aGlzLl9zZWNvbmRGcmFjdGlvbiwgdGhpcy5fdGltZXpvbmUsICd4czp0aW1lJyk7XG5cdFx0XHRjYXNlICd4czpkYXRlJzpcblx0XHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLl95ZWFycywgdGhpcy5fbW9udGhzLCB0aGlzLl9kYXlzLCAwLCAwLCAwLCAwLCB0aGlzLl90aW1lem9uZSwgJ3hzOmRhdGUnKTtcblx0XHRcdGNhc2UgJ3hzOmRhdGVUaW1lJzpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy5feWVhcnMsIHRoaXMuX21vbnRocywgdGhpcy5fZGF5cywgdGhpcy5faG91cnMsIHRoaXMuX21pbnV0ZXMsIHRoaXMuX3NlY29uZHMsIHRoaXMuX3NlY29uZEZyYWN0aW9uLCB0aGlzLl90aW1lem9uZSwgJ3hzOmRhdGVUaW1lJyk7XG5cdFx0fVxuXHR9XG59XG5cbi8vIGRhdGVUaW1lICAgIHwgKC0peXl5eS1tbS1kZFRoaDptbTpzcy5zcyhafFsrLV1oaDptbSlcbi8vIHRpbWUgICAgICAgIHwgICAgICAgICAgICAgICBoaDptbTpzcy5zcyhafFsrLV1oaDptbSlcbi8vIGRhdGUgICAgICAgIHwgKC0peXl5eS1tbS1kZCAgICAgICAgICAgIChafFsrLV1oaDptbSlcbi8vIGdZZWFyTW9udGggIHwgKC0peXl5eS1tbSAgICAgICAgICAgICAgIChafFsrLV1oaDptbSlcbi8vIGdZZWFyICAgICAgIHwgKC0peXl5eSAgICAgICAgICAgICAgICAgIChafFsrLV1oaDptbSlcbi8vIGdNb250aERheSAgIHwgICAgICAgLS1tbS1kZCAgICAgICAgICAgIChafFsrLV1oaDptbSlcbi8vIGdEYXkgICAgICAgIHwgICAgICAgICAtLS1kZCAgICAgICAgICAgIChafFsrLV1oaDptbSlcbi8vIGdNb250aCAgICAgIHwgICAgICAgLS1tbSAgICAgICAgICAgICAgIChafFsrLV1oaDptbSlcbi8qKlxuICogQHN0YXRpY1xuICogQHBhcmFtICAge3N0cmluZ30gICAgc3RyaW5nXG4gKiBAcmV0dXJuICB7RGF0ZVRpbWV9XG4gKi9cbkRhdGVUaW1lLmZyb21TdHJpbmcgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG5cdGNvbnN0IHJlZ2V4ID0gL14oPzooLT9cXGR7NCx9KSk/KD86LS0/KFxcZFxcZCkpPyg/Oi17MSwzfShcXGRcXGQpKT8oVCk/KD86KFxcZFxcZCk6KFxcZFxcZCk6KFxcZFxcZCkpPyhcXC5cXGQrKT8oWnwoPzpbKy1dXFxkXFxkOlxcZFxcZCkpPyQvO1xuXHRjb25zdCBtYXRjaCA9IHJlZ2V4LmV4ZWMoc3RyaW5nKTtcblxuXHRjb25zdCB5ZWFycyA9IG1hdGNoWzFdID8gcGFyc2VJbnQobWF0Y2hbMV0sIDEwKSA6IG51bGw7XG5cdGNvbnN0IG1vbnRocyA9IHBhcnNlTWF0Y2gobWF0Y2hbMl0pO1xuXHRjb25zdCBkYXlzID0gcGFyc2VNYXRjaChtYXRjaFszXSk7XG5cdGNvbnN0IHQgPSBtYXRjaFs0XTtcblx0Y29uc3QgaG91cnMgPSBwYXJzZU1hdGNoKG1hdGNoWzVdKTtcblx0Y29uc3QgbWludXRlcyA9IHBhcnNlTWF0Y2gobWF0Y2hbNl0pO1xuXHRjb25zdCBzZWNvbmRzID0gcGFyc2VNYXRjaChtYXRjaFs3XSk7XG5cdGNvbnN0IHNlY29uZEZyYWN0aW9uID0gbWF0Y2hbOF0gPyBwYXJzZUZsb2F0KG1hdGNoWzhdKSA6IDA7XG5cdGNvbnN0IHRpbWV6b25lID0gbWF0Y2hbOV0gPyBEYXlUaW1lRHVyYXRpb24uZnJvbVRpbWV6b25lU3RyaW5nKG1hdGNoWzldKSA6IG51bGw7XG5cblx0aWYgKHllYXJzICYmICh5ZWFycyA8IC0yNzE4MjEgfHwgeWVhcnMgPiAyNzM4NjApKSB7XG5cdFx0Ly8gVGhlc2UgYXJlIHRoZSBKYXZhU2NyaXB0IGJvdW5kcyBmb3IgZGF0ZSAoaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdGltZS12YWx1ZXMtYW5kLXRpbWUtcmFuZ2UpXG5cdFx0dGhyb3cgbmV3IEVycm9yKCdGT0RUMDAwMTogRGF0ZXRpbWUgeWVhciBpcyBvdXQgb2YgYm91bmRzJyk7XG5cdH1cblxuXHRpZiAodCkge1xuXHRcdC8vIFRoZXJlIGlzIGEgVCBzZXBhcmF0aW5nIHRoZSBkYXRlIGFuZCB0aW1lIGNvbXBvbmVudHMgLT4gZGF0ZVRpbWVcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKFxuXHRcdFx0eWVhcnMsXG5cdFx0XHRtb250aHMsXG5cdFx0XHRkYXlzLFxuXHRcdFx0aG91cnMsXG5cdFx0XHRtaW51dGVzLFxuXHRcdFx0c2Vjb25kcyxcblx0XHRcdHNlY29uZEZyYWN0aW9uLFxuXHRcdFx0dGltZXpvbmUsXG5cdFx0XHQneHM6ZGF0ZVRpbWUnKTtcblx0fVxuXG5cdGlmIChob3VycyAhPT0gbnVsbCAmJiBtaW51dGVzICE9PSBudWxsICYmIHNlY29uZHMgIT09IG51bGwpIHtcblx0XHQvLyBUaGVyZSBpcyBubyBUIHNlcGFyYXRvciwgYnV0IHRoZXJlIGlzIGEgdGltZSBjb21wb25lbnQgLT4gdGltZVxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXG5cdFx0XHQxOTcyLFxuXHRcdFx0MTIsXG5cdFx0XHQzMSxcblx0XHRcdGhvdXJzLFxuXHRcdFx0bWludXRlcyxcblx0XHRcdHNlY29uZHMsXG5cdFx0XHRzZWNvbmRGcmFjdGlvbixcblx0XHRcdHRpbWV6b25lLFxuXHRcdFx0J3hzOnRpbWUnKTtcblx0fVxuXG5cdGlmICh5ZWFycyAhPT0gbnVsbCAmJiBtb250aHMgIT09IG51bGwgJiYgZGF5cyAhPT0gbnVsbCkge1xuXHRcdC8vIFRoZXJlIGlzIG5vIFQgc2VwYXJhdG9yLCBidXQgdGhlcmUgaXMgYSBjb21wbGV0ZSBkYXRlIGNvbXBvbmVudCAtPiBkYXRlXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShcblx0XHRcdHllYXJzLFxuXHRcdFx0bW9udGhzLFxuXHRcdFx0ZGF5cyxcblx0XHRcdDAsXG5cdFx0XHQwLFxuXHRcdFx0MCxcblx0XHRcdDAsXG5cdFx0XHR0aW1lem9uZSxcblx0XHRcdCd4czpkYXRlJyk7XG5cdH1cblxuXHRpZiAoeWVhcnMgIT09IG51bGwgJiYgbW9udGhzICE9PSBudWxsKSB7XG5cdFx0Ly8gVGhlcmUgaXMgbm8gY29tcGxldGUgZGF0ZSBjb21wb25lbnQsIGJ1dCB0aGVyZSBpcyBhIHllYXIgYW5kIGEgbW9udGggLT4gZ1llYXJNb250aFxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXG5cdFx0XHR5ZWFycyxcblx0XHRcdG1vbnRocyxcblx0XHRcdDEsXG5cdFx0XHQwLFxuXHRcdFx0MCxcblx0XHRcdDAsXG5cdFx0XHQwLFxuXHRcdFx0dGltZXpvbmUsXG5cdFx0XHQneHM6Z1llYXJNb250aCcpO1xuXHR9XG5cblx0aWYgKG1vbnRocyAhPT0gbnVsbCAmJiBkYXlzICE9PSBudWxsKSB7XG5cdFx0Ly8gVGhlcmUgaXMgbm8gY29tcGxldGUgZGF0ZSBjb21wb25lbnQsIGJ1dCB0aGVyZSBpcyBhIG1vbnRoIGFuZCBhIGRheSAtPiBnTW9udGhEYXlcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKFxuXHRcdFx0MTk3Mixcblx0XHRcdG1vbnRocyxcblx0XHRcdGRheXMsXG5cdFx0XHQwLFxuXHRcdFx0MCxcblx0XHRcdDAsXG5cdFx0XHQwLFxuXHRcdFx0dGltZXpvbmUsXG5cdFx0XHQneHM6Z01vbnRoRGF5Jyk7XG5cdH1cblxuXHRpZiAoeWVhcnMgIT09IG51bGwpIHtcblx0XHQvLyBUaGVyZSBpcyBvbmx5IGEgeWVhciAtPiBnWWVhclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXG5cdFx0XHR5ZWFycyxcblx0XHRcdDEsXG5cdFx0XHQxLFxuXHRcdFx0MCxcblx0XHRcdDAsXG5cdFx0XHQwLFxuXHRcdFx0MCxcblx0XHRcdHRpbWV6b25lLFxuXHRcdFx0J3hzOmdZZWFyJyk7XG5cdH1cblxuXHRpZiAobW9udGhzICE9PSBudWxsKSB7XG5cdFx0Ly8gVGhlcmUgaXMgb25seSBhIG1vbnRoIC0+IGdNb250aFxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXG5cdFx0XHQxOTcyLFxuXHRcdFx0bW9udGhzLFxuXHRcdFx0MSxcblx0XHRcdDAsXG5cdFx0XHQwLFxuXHRcdFx0MCxcblx0XHRcdDAsXG5cdFx0XHR0aW1lem9uZSxcblx0XHRcdCd4czpnTW9udGgnKTtcblx0fVxuXG5cdC8vIFRoZXJlIGlzIG9ubHkgb25lIG9wdGlvbiBsZWZ0IC0+IGdEYXlcblx0cmV0dXJuIG5ldyBEYXRlVGltZShcblx0XHQxOTcyLFxuXHRcdDEyLFxuXHRcdGRheXMsXG5cdFx0MCxcblx0XHQwLFxuXHRcdDAsXG5cdFx0MCxcblx0XHR0aW1lem9uZSxcblx0XHQneHM6Z0RheScpO1xufTtcblxuXG4vKipcbiAqIEBwYXJhbSAgIHtEYXRlVGltZX0gICBkYXRlVGltZTFcbiAqIEBwYXJhbSAgIHtEYXRlVGltZX0gICBkYXRlVGltZTJcbiAqIEBwYXJhbSAgIHs/RGF5VGltZUR1cmF0aW9ufSAgaW1wbGljaXRUaW1lem9uZVxuICogQHJldHVybiAge251bWJlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBhcmUgKGRhdGVUaW1lMSwgZGF0ZVRpbWUyLCBpbXBsaWNpdFRpbWV6b25lID0gdW5kZWZpbmVkKSB7XG5cdGNvbnN0IGpzVGltZTEgPSBkYXRlVGltZTEudG9KYXZhU2NyaXB0RGF0ZShpbXBsaWNpdFRpbWV6b25lKS5nZXRUaW1lKCk7XG5cdGNvbnN0IGpzVGltZTIgPSBkYXRlVGltZTIudG9KYXZhU2NyaXB0RGF0ZShpbXBsaWNpdFRpbWV6b25lKS5nZXRUaW1lKCk7XG5cblx0aWYgKGpzVGltZTEgPT09IGpzVGltZTIpIHtcblx0XHQvLyBXZSBzaG91bGQgYnJlYWsgdGhlIHRpZSBvbiB0aGUgc2Vjb25kRnJhY3Rpb24gcHJvcGVydHksIHdoaWNoIGhhcyBubyBjb3VudGVycGFydCBpbiBKUyBkYXRlc1xuXHRcdGlmIChkYXRlVGltZTEuX3NlY29uZEZyYWN0aW9uID09PSBkYXRlVGltZTIuX3NlY29uZEZyYWN0aW9uKSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9XG5cdFx0aWYgKGRhdGVUaW1lMS5fc2Vjb25kRnJhY3Rpb24gPiBkYXRlVGltZTIuX3NlY29uZEZyYWN0aW9uKSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9XG5cdFx0cmV0dXJuIC0xO1xuXHR9XG5cblx0aWYgKGpzVGltZTEgPiBqc1RpbWUyKSB7XG5cdFx0cmV0dXJuIDE7XG5cdH1cblxuXHRyZXR1cm4gLTE7XG59XG5cbi8qKlxuICogQHBhcmFtICAge0RhdGVUaW1lfSAgIGRhdGVUaW1lMVxuICogQHBhcmFtICAge0RhdGVUaW1lfSAgIGRhdGVUaW1lMlxuICogQHBhcmFtICAgez9EYXlUaW1lRHVyYXRpb259ICBpbXBsaWNpdFRpbWV6b25lXG4gKiBAcmV0dXJuICB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsIChkYXRlVGltZTEsIGRhdGVUaW1lMiwgaW1wbGljaXRUaW1lem9uZSA9IHVuZGVmaW5lZCkge1xuXHRyZXR1cm4gY29tcGFyZShkYXRlVGltZTEsIGRhdGVUaW1lMiwgaW1wbGljaXRUaW1lem9uZSkgPT09IDA7XG59XG5cbi8qKlxuICogQHBhcmFtICAge0RhdGVUaW1lfSAgIGRhdGVUaW1lMVxuICogQHBhcmFtICAge0RhdGVUaW1lfSAgIGRhdGVUaW1lMlxuICogQHBhcmFtICAgez9EYXlUaW1lRHVyYXRpb259ICBpbXBsaWNpdFRpbWV6b25lXG4gKiBAcmV0dXJuICB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlc3NUaGFuIChkYXRlVGltZTEsIGRhdGVUaW1lMiwgaW1wbGljaXRUaW1lem9uZSA9IHVuZGVmaW5lZCkge1xuXHRyZXR1cm4gY29tcGFyZShkYXRlVGltZTEsIGRhdGVUaW1lMiwgaW1wbGljaXRUaW1lem9uZSkgPCAwO1xufVxuXG4vKipcbiAqIEBwYXJhbSAgIHtEYXRlVGltZX0gICBkYXRlVGltZTFcbiAqIEBwYXJhbSAgIHtEYXRlVGltZX0gICBkYXRlVGltZTJcbiAqIEBwYXJhbSAgIHs/RGF5VGltZUR1cmF0aW9ufSAgaW1wbGljaXRUaW1lem9uZVxuICogQHJldHVybiAge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncmVhdGVyVGhhbiAoZGF0ZVRpbWUxLCBkYXRlVGltZTIsIGltcGxpY2l0VGltZXpvbmUgPSB1bmRlZmluZWQpIHtcblx0cmV0dXJuIGNvbXBhcmUoZGF0ZVRpbWUxLCBkYXRlVGltZTIsIGltcGxpY2l0VGltZXpvbmUpID4gMDtcbn1cblxuXG4vKipcbiAqIEBwYXJhbSAgIHtEYXRlVGltZX0gICBkYXRlVGltZTFcbiAqIEBwYXJhbSAgIHtEYXRlVGltZX0gICBkYXRlVGltZTJcbiAqIEBwYXJhbSAgIHs/RGF5VGltZUR1cmF0aW9ufSAgaW1wbGljaXRUaW1lem9uZVxuICogQHJldHVybiAge0RheVRpbWVEdXJhdGlvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZCAoZGF0ZVRpbWUxLCBkYXRlVGltZTIsIGltcGxpY2l0VGltZXpvbmUgPSB1bmRlZmluZWQpIHtcblx0Ly8gRGl2aWRlZCBieSAxMDAwIGJlY2F1c2UgZGF0ZSBzdWJ0cmFjdGlvbiByZXN1bHRzIGluIG1pbGxpc2Vjb25kc1xuXHRjb25zdCBzZWNvbmRzT2ZEdXJhdGlvbiA9IChkYXRlVGltZTEudG9KYXZhU2NyaXB0RGF0ZShpbXBsaWNpdFRpbWV6b25lKSArIGRhdGVUaW1lMi50b0phdmFTY3JpcHREYXRlKGltcGxpY2l0VGltZXpvbmUpKSAvIDEwMDA7XG5cdHJldHVybiBuZXcgRGF5VGltZUR1cmF0aW9uKFxuXHRcdHNlY29uZHNPZkR1cmF0aW9uXG5cdCk7XG59XG5cbi8qKlxuICogQHBhcmFtICAge0RhdGVUaW1lfSAgIGRhdGVUaW1lMVxuICogQHBhcmFtICAge0RhdGVUaW1lfSAgIGRhdGVUaW1lMlxuICogQHBhcmFtICAgez9EYXlUaW1lRHVyYXRpb259ICBpbXBsaWNpdFRpbWV6b25lXG4gKiBAcmV0dXJuICB7RGF5VGltZUR1cmF0aW9ufVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3QgKGRhdGVUaW1lMSwgZGF0ZVRpbWUyLCBpbXBsaWNpdFRpbWV6b25lID0gdW5kZWZpbmVkKSB7XG5cdC8vIERpdmlkZWQgYnkgMTAwMCBiZWNhdXNlIGRhdGUgc3VidHJhY3Rpb24gcmVzdWx0cyBpbiBtaWxsaXNlY29uZHNcblx0Y29uc3Qgc2Vjb25kc09mRHVyYXRpb24gPSAoZGF0ZVRpbWUxLnRvSmF2YVNjcmlwdERhdGUoaW1wbGljaXRUaW1lem9uZSkgLSBkYXRlVGltZTIudG9KYXZhU2NyaXB0RGF0ZShpbXBsaWNpdFRpbWV6b25lKSkgLyAxMDAwO1xuXHRyZXR1cm4gbmV3IERheVRpbWVEdXJhdGlvbihcblx0XHRzZWNvbmRzT2ZEdXJhdGlvblxuXHQpO1xufVxuXG4vKipcbiAqIEBwYXJhbSAgIHshRGF0ZVRpbWV9ICAgZGF0ZVRpbWVcbiAqIEBwYXJhbSAgIHshQWJzdHJhY3REdXJhdGlvbn0gICBfZHVyYXRpb25cbiAqIEByZXR1cm4gIHshRGF0ZVRpbWV9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREdXJhdGlvbiAoZGF0ZVRpbWUsIF9kdXJhdGlvbikge1xuXHR0aHJvdyBuZXcgRXJyb3IoYE5vdCBpbXBsZW1lbnRlZDogYWRkaW5nIGR1cmF0aW9ucyB0byAke2RhdGVUaW1lLl90eXBlfWApO1xufVxuXG5cbi8qKlxuICogQHBhcmFtICAgeyFEYXRlVGltZX0gICBkYXRlVGltZVxuICogQHBhcmFtICAgeyFBYnN0cmFjdER1cmF0aW9ufSAgIF9kdXJhdGlvblxuICogQHJldHVybiAgeyFEYXRlVGltZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0RHVyYXRpb24gKGRhdGVUaW1lLCBfZHVyYXRpb24pIHtcblx0dGhyb3cgbmV3IEVycm9yKGBOb3QgaW1wbGVtZW50ZWQ6IHN1YnRyYWN0aW5nIGR1cmF0aW9ucyBmcm9tICR7ZGF0ZVRpbWUuX3R5cGV9YCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IERhdGVUaW1lO1xuIl19