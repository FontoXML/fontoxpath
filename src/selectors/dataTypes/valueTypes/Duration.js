import YearMonthDuration from './YearMonthDuration';
import DayTimeDuration from './DayTimeDuration';

const MONTHS_TO_MIN_MAX_VALUES = [
	[28, 31],
	[59, 62],
	[89, 91],
	[120, 123],
	[150, 153],
	[181, 184],
	[212, 215],
	[242, 245],
	[273, 276],
	[303, 306],
	[334, 337],
	[365, 366]
];

function computeMinDays (duration) {
	const years = duration.getYears();
	const months = duration.getMonths();
	const minNumberOfLeapYears = Math.floor(years / 4);

	return duration.getDays() +
		(months === 0 ? 0 : MONTHS_TO_MIN_MAX_VALUES[months - 1][0]) +
		minNumberOfLeapYears * 366 + (years - minNumberOfLeapYears) * 365;
}

function computeMaxDays (duration) {
	const years = duration.getYears();
	const months = duration.getMonths();
	const maxNumberOfLeapYears = Math.floor(years / 4) + (years % 4 > 0 ? 1 : 0);

	return duration.getDays() +
		(months === 0 ? 0 : MONTHS_TO_MIN_MAX_VALUES[months - 1][1]) +
		maxNumberOfLeapYears * 366 + (years - maxNumberOfLeapYears) * 365;
}

class Duration {
	constructor (yearMonthDuration, dayTimeDuration) {
		this._yearMonthDuration = yearMonthDuration;
		this._dayTimeDuration = dayTimeDuration;
	}

	getYearMonthDuration () {
		return this._yearMonthDuration;
	}

	getDayTimeDuration () {
		return this._dayTimeDuration;
	}

	getYears () {
		return this._yearMonthDuration.getYears();
	}

	getMonths () {
		return this._yearMonthDuration.getMonths();
	}

	getDays () {
		return this._dayTimeDuration.getDays();
	}

	getHours () {
		return this._dayTimeDuration.getHours();
	}

	getMinutes () {
		return this._dayTimeDuration.getMinutes();
	}

	getSeconds () {
		return this._dayTimeDuration.getSeconds();
	}

	isPositive () {
		return this._yearMonthDuration.isPositive();
	}

	compare (other) {
		if (this.isPositive() && !other.isPositive()) {
			return 1;
		}

		if (!this.isPositive() && other.isPositive()) {
			return -1;
		}

		if (this.equals(other)) {
			return 0;
		}

		const bothPositive = this.isPositive() && other.isPositive();
		const thisMinDays = computeMinDays(this);
		const thisMaxDays = computeMaxDays(this);
		const otherMinDays = computeMinDays(other);
		const otherMaxDays = computeMaxDays(other);

		if (thisMinDays === otherMinDays && thisMaxDays === otherMaxDays) {
			const thisSecondsWithoutDays = this.getHours() * 3600 + this.getMinutes() * 60 + this.getSeconds();
			const otherSecondsWithoutDays = other.getHours() * 3600 + other.getMinutes() * 60 + other.getSeconds();
			if (thisSecondsWithoutDays > otherSecondsWithoutDays) {
				return bothPositive ? 1 : -1;
			}

			if (thisSecondsWithoutDays < otherSecondsWithoutDays) {
				return bothPositive ? -1 : 1;
			}

			return 0;
		}

		if (thisMinDays > otherMaxDays) {
			return bothPositive ? 1 : -1;
		}

		if (thisMaxDays < otherMinDays) {
			return bothPositive ? -1 : 1;
		}
	}

	equals (other) {
		return this._yearMonthDuration.equals(other._yearMonthDuration) &&
			this._dayTimeDuration.equals(other._dayTimeDuration);
	}

	toString () {
		const string = this._yearMonthDuration.isPositive() ? 'P' : '-P';
		const TYM = this._yearMonthDuration.toStringWithoutP();
		const TDT = this._dayTimeDuration.toStringWithoutP();

		if (TYM === '0M') {
			return string + TDT;
		}
		if (TDT === 'T0S') {
			return string + TYM;
		}

		return string + TYM + TDT;
	}
}

/**
 * @static
 * @param  {number}  years
 * @param  {number}  months
 * @param  {number}  days
 * @param  {number}  hours
 * @param  {number}  minutes
 * @param  {number}  seconds
 * @param  {number}  secondFraction
 * @param  {boolean} isPositive
 * @return {Duration}
 */
Duration.fromParts = function (years, months, days, hours, minutes, seconds, secondFraction, isPositive) {
	return new Duration(
		new YearMonthDuration(years * 12 + months, isPositive),
		new DayTimeDuration(days * 86400 + hours * 3600 + minutes * 60 + seconds, secondFraction, isPositive));
};

/**
 * @static
 * @param   {string}  string
 * @return  {?Duration}
 */
Duration.fromString = function (string) {
	const regex = /^(-)?P(\d+Y)?(\d+M)?(\d+D)?(?:T(\d+H)?(\d+M)?(\d+(\.\d*)?S)?)?$/;
	const match = regex.exec(string);

	if (!match) {
		return null;
	}

	const isPositive = !match[1];
	const years = match[2] ? parseInt(match[2], 10) : 0;
	const months = match[3] ? parseInt(match[3], 10) : 0;
	const days = match[4] ? parseInt(match[4], 10) : 0;
	const hours = match[5] ? parseInt(match[5], 10) : 0;
	const minutes = match[6] ? parseInt(match[6], 10) : 0;
	const seconds = match[7] ? parseInt(match[7], 10) : 0;
	const secondFraction = match[8] ? parseFloat(match[8]) : 0;

	return Duration.fromParts(years, months, days, hours, minutes, seconds, secondFraction, isPositive);
};

/**
 * @static
 * @param   {YearMonthDuration}  yearMonthDuration
 * @return  {Duration}
 */
Duration.fromYearMonthDuration = function (yearMonthDuration) {
	return new Duration(yearMonthDuration, new DayTimeDuration(0, 0, yearMonthDuration.isPositive()));
};

/**
 * @static
 * @param   {DayTimeDuration}  dayTimeDuration
 * @return  {Duration}
 */
Duration.fromDayTimeDuration = function (dayTimeDuration) {
	return new Duration(new YearMonthDuration(0, dayTimeDuration.isPositive()), dayTimeDuration);
};

export default Duration;
