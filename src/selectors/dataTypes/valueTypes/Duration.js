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

function yearMonthDurationToString (duration) {
	const years = duration.getYears();
	const months = duration.getMonths();
	const stringValue = `${years ? `${years}Y` : ''}` + `${months ? `${months}M` : ''}`;

	return stringValue || '0M';
}

function dayTimeDurationToString (duration) {
	const days = duration.getDays();
	const hours = duration.getHours();
	const minutes = duration.getMinutes();
	const seconds = duration.getSeconds();
	const stringValue = `${days ? `${days}DT` : 'T'}` +
		`${hours ? `${hours}H` : ''}` +
		`${minutes ? `${minutes}M` : ''}` +
		`${seconds ? `${seconds}S` : ''}`;

	return stringValue === 'T' ? 'T0S' : stringValue;
}

class Duration {
	constructor (years, months, days, hours, minutes, seconds, secondFraction, isPositive, type = 'xs:duration') {
		this._months = years * 12 + months;
		this._seconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
		// Second fractions will be kept track of separately, as they introduce unnecessary imprecision errors when
		//   retreiving seconds due to the usage of the % and / operators.
		this._secondFraction = secondFraction;
		this._isPositive = isPositive;
		this._type = type;
	}

	toDuration () {
		this._type = 'xs:duration';
		return this;
	}

	toDayTime () {
		this._months = 0;
		this._type = 'xs:dayTimeDuration';
		return this;
	}

	toYearMonth () {
		this._seconds = 0;
		this._secondFraction = 0;
		this._type = 'xs:yearMonthDuration';
		return this;
	}

	getYears () {
		return Math.floor(this._months / 12);
	}

	getMonths () {
		return this._months % 12;
	}

	getDays () {
		return Math.floor(this._seconds / 86400);
	}

	getHours () {
		return Math.floor(this._seconds % 86400 / 3600);
	}

	getMinutes () {
		return Math.floor(this._seconds % 3600 / 60);
	}

	getSeconds () {
		return this._seconds % 60 + this._secondFraction;
	}

	isPositive () {
		return this._isPositive;
	}

	compare (other) {
		if (this._isPositive && !other._isPositive) {
			return 1;
		}

		if (!this._isPositive && other._isPositive) {
			return -1;
		}

		const bothPositive = this._isPositive && other._isPositive;
		if (bothPositive &&
			this._months === other._months &&
			this._seconds === other._seconds &&
			this._secondFraction === other._secondFraction) {
			return 0;
		}

		const thisMinDays = computeMinDays(this);
		const thisMaxDays = computeMaxDays(this);
		const otherMinDays = computeMinDays(other);
		const otherMaxDays = computeMaxDays(other);

		if (thisMinDays === otherMinDays && thisMaxDays === otherMaxDays) {
			const thisSecondsWithoutDays = this._seconds % 86400 + this._secondFraction;
			const otherSecondsWithoutDays = other._seconds % 86400 + other._secondFraction;
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
		return this._isPositive === other._isPositive &&
			this._months === other._months &&
			this._seconds === other._seconds &&
			this._secondFraction === other._secondFraction;
	}

	toString () {
		const string = (this._isPositive ? 'P' : '-P');

		if (this._type === 'xs:yearMonthDuration') {
			return string + yearMonthDurationToString(this);
		}

		if (this._type === 'xs:dayTimeDuration') {
			return string + dayTimeDurationToString(this);
		}

		if (this._type === 'xs:duration') {
			const TYM = yearMonthDurationToString(this);
			const TDT = dayTimeDurationToString(this);

			if (TYM === '0M') {
				return string + TDT;
			}
			if (TDT === 'T0S') {
				return string + TYM;
			}

			return string + TYM + TDT;
		}
	}
}

/**
 * @static
 * @param   {Duration}  duration1
 * @param   {Duration}  duration2
 * @return  {boolean}
 */
Duration.equals = function (duration1, duration2) {
	return duration1.equals(duration2);
};

/**
 * @static
 * @param   {Duration}  duration1
 * @param   {Duration}  duration2
 * @return  {boolean}
 */
Duration.yearMonthDurationLessThan = function (duration1, duration2) {
	if (duration1._isPositive && !duration2._isPositive) {
		return false;
	}

	if (!duration1._isPositive && duration2._isPositive) {
		return true;
	}

	return duration1._months < duration2._months;
};

/**
 * @static
 * @param   {Duration}  duration1
 * @param   {Duration}  duration2
 * @return  {boolean}
 */
Duration.yearMonthDurationGreaterThan = function (duration1, duration2) {
	if (duration1._isPositive && !duration2._isPositive) {
		return true;
	}

	if (!duration1._isPositive && duration2._isPositive) {
		return false;
	}

	return duration1._months > duration2._months;
};

/**
 * @static
 * @param   {Duration}  duration1
 * @param   {Duration}  duration2
 * @return  {boolean}
 */
Duration.dayTimeDurationLessThan = function (duration1, duration2) {
	if (duration1._isPositive && !duration2._isPositive) {
		return false;
	}

	if (!duration1._isPositive && duration2._isPositive) {
		return true;
	}

	return (duration1._seconds + duration1._secondFraction) < (duration2._seconds + duration2._secondFraction);
};

/**
 * @static
 * @param   {Duration}  duration1
 * @param   {Duration}  duration2
 * @return  {boolean}
 */
Duration.dayTimeDurationGreaterThan = function (duration1, duration2) {
	if (duration1._isPositive && !duration2._isPositive) {
		return true;
	}

	if (!duration1._isPositive && duration2._isPositive) {
		return false;
	}

	return (duration1._seconds + duration1._secondFraction) > (duration2._seconds + duration2._secondFraction);
};

/**
 * @static
 * @param   {string}  string
 * @param   {string}  type
 * @return  {?Duration}
 */
Duration.fromString = function (string, type = 'xs:duration') {
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

	return new Duration(years, months, days, hours, minutes, seconds, secondFraction, isPositive, type);
};

/**
 * @static
 * @param   {string}  string
 * @return  {Duration}
 */
Duration.fromTimezoneString = function (string) {
	const regex = /^(Z)|([+-])([01]\d):([0-5]\d)$/;
	const match = regex.exec(string);

	if (match[1] === 'Z') {
		return new Duration(0, 0, 0, 0, 0, 0, 0, true, 'xs:dayTimeDuration');
	}

	const isPositive = match[2] === '+';
	const hours = match[3] ? parseInt(match[3], 10) : 0;
	const minutes = match[4] ? parseInt(match[4], 10) : 0;

	return new Duration(0, 0, 0, hours, minutes, 0, 0, isPositive, 'xs:dayTimeDuration');
};

/**
 * @static
 * @param   {Date}  date
 * @return  {Duration}
 */
Duration.fromJavascriptDate = function (date) {
	const minutes = date.getTimezoneOffset();
	const isPositive = minutes > -1;

	return new Duration(0, 0, 0, 0, Math.abs(minutes), 0, 0, isPositive, 'xs:dayTimeDuration');
};

export default Duration;
