class DayTimeDuration {
	constructor (seconds) {
		// if (seconds > Number.MAX_SAFE_INTEGER || Math.abs(seconds) === Infinity) {
		// 	throw new Error('FODT0002: Value overflow while constructing xs:yearMonthDuration');
		// }
		// this._seconds = seconds < Number.MIN_SAFE_INTEGER || Object.is(-0, seconds) ? 0 : seconds;
		this._seconds = seconds;
	}

	getYears () {
		return 0;
	}

	getMonths () {
		return 0;
	}

	getDays () {
		return (this._seconds / 86400) | 0;
	}

	getHours () {
		return (this._seconds % 86400 / 3600) | 0;
	}

	getMinutes () {
		return (this._seconds % 3600 / 60) | 0;
	}

	getSeconds () {
		const result = this._seconds % 60;
		return Object.is(-0, result) ? 0 : result;
	}

	isPositive () {
		return Object.is(-0, this._seconds) ? false : this._seconds >= 0;
	}

	equals (other) {
		return this._seconds === other._seconds;
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
 * @param   {DayTimeDuration}  dayTimeDuration1
 * @param   {DayTimeDuration}  dayTimeDuration2
 * @return  {boolean}
 */
DayTimeDuration.lessThan = function (dayTimeDuration1, dayTimeDuration2) {
	return dayTimeDuration1._seconds < dayTimeDuration2._seconds;
};

/**
 * @static
 * @param   {DayTimeDuration}  dayTimeDuration1
 * @param   {DayTimeDuration}  dayTimeDuration2
 * @return  {boolean}
 */
DayTimeDuration.greaterThan = function (dayTimeDuration1, dayTimeDuration2) {
	return dayTimeDuration1._seconds > dayTimeDuration2._seconds;
};

DayTimeDuration.add = function (dayTimeDuration1, dayTimeDuration2) {
	return new DayTimeDuration(dayTimeDuration1._seconds + dayTimeDuration2._seconds);
};

DayTimeDuration.subtract = function (dayTimeDuration1, dayTimeDuration2) {
	return new DayTimeDuration(dayTimeDuration1._seconds - dayTimeDuration2._seconds);
};

DayTimeDuration.multiply = function (dayTimeDuration, double) {
	if (isNaN(double)) {
		throw new Error('FOCA0005: Cannot divide xs:dayTimeDuration by NaN');
	}
	const result = dayTimeDuration._seconds * double;
	if (result > Number.MAX_SAFE_INTEGER || Math.abs(result) === Infinity) {
		throw new Error('FODT0002: Value overflow while multiplying xs:yearMonthDuration');
	}
	return new DayTimeDuration(result < Number.MIN_SAFE_INTEGER || Object.is(-0, result) ? 0 : result);
};

DayTimeDuration.divide = function (dayTimeDuration, double) {
	if (isNaN(double)) {
		throw new Error('FOCA0005: Cannot divide xs:dayTimeDuration by NaN');
	}
	const result = dayTimeDuration._seconds / double;
	if (result > Number.MAX_SAFE_INTEGER || Math.abs(result) === Infinity) {
		throw new Error('FODT0002: Value overflow while dividing xs:yearMonthDuration');
	}
	return new DayTimeDuration(result < Number.MIN_SAFE_INTEGER || Object.is(-0, result) ? 0 : result);
};

DayTimeDuration.divideByDayTimeDuration = function (dayTimeDuration1, dayTimeDuration2) {
	if (dayTimeDuration2._seconds === 0) {
		return new Error('FOAR0001: Division by 0');
	}
	return dayTimeDuration1._seconds / dayTimeDuration2._seconds;
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

export default DayTimeDuration;
