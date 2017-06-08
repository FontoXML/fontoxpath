class DayTimeDuration {
	constructor (seconds, secondFraction, isPositive) {
		// Second fractions will be kept track of separately, as they introduce unnecessary imprecision errors when
		//   retreiving seconds due to the usage of the % and / operators.
		this._seconds = seconds;
		this._secondFraction = secondFraction;
		this._isPositive = (seconds === 0 && secondFraction === 0) || isPositive;
	}

	getYears () {
		return 0;
	}

	getMonths () {
		return 0;
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

	equals (other) {
		return this._isPositive === other._isPositive &&
			this._seconds === other._seconds &&
			this._secondFraction === other._secondFraction;
	}

	toStringWithoutP () {
		const days = this.getDays();
		const hours = this.getHours();
		const minutes = this.getMinutes();
		const seconds = this.getSeconds();
		const stringValue = `${days ? `${days}DT` : 'T'}` +
			`${hours ? `${hours}H` : ''}` +
			`${minutes ? `${minutes}M` : ''}` +
			`${seconds ? `${seconds}S` : ''}`;

		return stringValue === 'T' ? 'T0S' : stringValue;
	}

	toString () {
		return (this._isPositive ? 'P' : '-P') + this.toStringWithoutP();
	}
}

/**
 * @static
 * @param   {DayTimeDuration}  dayTimeDuration1
 * @param   {DayTimeDuration}  dayTimeDuration2
 * @return  {boolean}
 */
DayTimeDuration.lessThan = function (dayTimeDuration1, dayTimeDuration2) {
	if (dayTimeDuration1._isPositive && !dayTimeDuration2._isPositive) {
		return false;
	}

	if (!dayTimeDuration1._isPositive && dayTimeDuration2._isPositive) {
		return true;
	}

	return (dayTimeDuration1._seconds + dayTimeDuration1._secondFraction) < (dayTimeDuration2._seconds + dayTimeDuration2._secondFraction);
};

/**
 * @static
 * @param   {DayTimeDuration}  dayTimeDuration1
 * @param   {DayTimeDuration}  dayTimeDuration2
 * @return  {boolean}
 */
DayTimeDuration.greaterThan = function (dayTimeDuration1, dayTimeDuration2) {
	if (dayTimeDuration1._isPositive && !dayTimeDuration2._isPositive) {
		return true;
	}

	if (!dayTimeDuration1._isPositive && dayTimeDuration2._isPositive) {
		return false;
	}

	return (dayTimeDuration1._seconds + dayTimeDuration1._secondFraction) > (dayTimeDuration2._seconds + dayTimeDuration2._secondFraction);
};

DayTimeDuration.add = function (dayTimeDuration1, dayTimeDuration2) {
	const seconds1 = dayTimeDuration1._isPositive ? dayTimeDuration1._seconds + dayTimeDuration1._secondFraction : -(dayTimeDuration1._seconds + dayTimeDuration1._secondFraction);
	const seconds2 = dayTimeDuration2._isPositive ? dayTimeDuration2._seconds + dayTimeDuration1._secondFraction : -(dayTimeDuration2._seconds + dayTimeDuration1._secondFraction);
	const result = seconds1 + seconds2;

	return new DayTimeDuration(Math.floor(result), parseFloat('.' + (result + '').split('.')[1]) || 0, result > -1);
};

DayTimeDuration.subtract = function (dayTimeDuration1, dayTimeDuration2) {
	const seconds1 = dayTimeDuration1._isPositive ? dayTimeDuration1._seconds + dayTimeDuration1._secondFraction : -(dayTimeDuration1._seconds + dayTimeDuration1._secondFraction);
	const seconds2 = dayTimeDuration2._isPositive ? dayTimeDuration2._seconds + dayTimeDuration1._secondFraction : -(dayTimeDuration2._seconds + dayTimeDuration1._secondFraction);
	const result = seconds1 - seconds2;

	return new DayTimeDuration(Math.floor(result), parseFloat('.' + (result + '').split('.')[1]) || 0, result > -1);
};

DayTimeDuration.multiply = function (dayTimeDuration1, double) {
	const seconds1 = dayTimeDuration1._isPositive ? dayTimeDuration1._seconds + dayTimeDuration1._secondFraction : -(dayTimeDuration1._seconds + dayTimeDuration1._secondFraction);
	const result = seconds1 * double;

	return new DayTimeDuration(Math.floor(result), parseFloat('.' + (result + '').split('.')[1]) || 0, result > -1);
};

DayTimeDuration.divide = function (dayTimeDuration1, double) {
	const seconds1 = dayTimeDuration1._isPositive ? dayTimeDuration1._seconds + dayTimeDuration1._secondFraction : -(dayTimeDuration1._seconds + dayTimeDuration1._secondFraction);
	const result = seconds1 / double;

	return new DayTimeDuration(Math.floor(result), parseFloat('.' + (result + '').split('.')[1]) || 0, result > -1);
};

DayTimeDuration.divideByDayTimeDuration = function (dayTimeDuration1, dayTimeDuration2) {
	const seconds1 = dayTimeDuration1._isPositive ? dayTimeDuration1._seconds + dayTimeDuration1._secondFraction : -(dayTimeDuration1._seconds + dayTimeDuration1._secondFraction);
	const seconds2 = dayTimeDuration2._isPositive ? dayTimeDuration2._seconds + dayTimeDuration1._secondFraction : -(dayTimeDuration2._seconds + dayTimeDuration1._secondFraction);
	return seconds1 / seconds2;
};

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
	return new DayTimeDuration(days * 86400 + hours * 3600 + minutes * 60 + seconds, secondFraction, isPositive);
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

export default DayTimeDuration;
