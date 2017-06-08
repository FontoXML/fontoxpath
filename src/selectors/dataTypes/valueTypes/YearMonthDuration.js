class YearMonthDuration {
	constructor (months, isPositive) {
		this._months = months;
		this._isPositive = isPositive;
	}

	getYears () {
		return Math.floor(this._months / 12);
	}

	getMonths () {
		return this._months % 12;
	}

	getDays () {
		return 0;
	}

	getHours () {
		return 0;
	}

	getMinutes () {
		return 0;
	}

	getSeconds () {
		return 0;
	}

	isPositive () {
		return this._isPositive;
	}

	equals (other) {
		return this._isPositive === other._isPositive &&
			this._months === other._months;
	}

	toStringWithoutP () {
		const years = this.getYears();
		const months = this.getMonths();
		const stringValue = `${years ? `${years}Y` : ''}` + `${months ? `${months}M` : ''}`;

		return stringValue || '0M';
	}

	toString () {
		return (this._isPositive ? 'P' : '-P') + this.toStringWithoutP();
	}
}

/**
 * @static
 * @param   {YearMonthDuration}  yearMonthDuration1
 * @param   {YearMonthDuration}  yearMonthDuration2
 * @return  {boolean}
 */
YearMonthDuration.lessThan = function (yearMonthDuration1, yearMonthDuration2) {
	if (yearMonthDuration1._isPositive && !yearMonthDuration2._isPositive) {
		return false;
	}

	if (!yearMonthDuration1._isPositive && yearMonthDuration2._isPositive) {
		return true;
	}

	return yearMonthDuration1._months < yearMonthDuration2._months;
};

/**
 * @static
 * @param   {YearMonthDuration}  yearMonthDuration1
 * @param   {YearMonthDuration}  yearMonthDuration2
 * @return  {boolean}
 */
YearMonthDuration.greaterThan = function (yearMonthDuration1, yearMonthDuration2) {
	if (yearMonthDuration1._isPositive && !yearMonthDuration2._isPositive) {
		return true;
	}

	if (!yearMonthDuration1._isPositive && yearMonthDuration2._isPositive) {
		return false;
	}

	return yearMonthDuration1._months > yearMonthDuration2._months;
};

YearMonthDuration.add = function (yearMonthDuration1, yearMonthDuration2) {
	const months1 = yearMonthDuration1._isPositive ? yearMonthDuration1._months : -yearMonthDuration1._months;
	const months2 = yearMonthDuration2._isPositive ? yearMonthDuration2._months : -yearMonthDuration2._months;
	const result = months1 + months2;

	return new YearMonthDuration(Math.abs(result), result > -1);
};

YearMonthDuration.subtract = function (yearMonthDuration1, yearMonthDuration2) {
	const months1 = yearMonthDuration1._isPositive ? yearMonthDuration1._months : -yearMonthDuration1._months;
	const months2 = yearMonthDuration2._isPositive ? yearMonthDuration2._months : -yearMonthDuration2._months;
	const result = months1 - months2;

	return new YearMonthDuration(Math.abs(result), result > -1);
};

YearMonthDuration.multiply = function (yearMonthDuration, double) {
	if (isNaN(double)) {
		throw new Error('FOCA0005: Cannot multiply xs:yearMonthDuration by NaN');
	}

	const months1 = yearMonthDuration._isPositive ? yearMonthDuration._months : -yearMonthDuration._months;
	const result = months1 * double;

	return new YearMonthDuration(Math.abs(result), result > -1);
};

YearMonthDuration.divide = function (yearMonthDuration, double) {
	if (isNaN(double)) {
		throw new Error('FOCA0005: Cannot divide xs:yearMonthDuration by NaN');
	}

	const months1 = yearMonthDuration._isPositive ? yearMonthDuration._months : -yearMonthDuration._months;
	const result = months1 / double;

	return new YearMonthDuration(Math.abs(result), result > -1);
};

YearMonthDuration.divideByYearMonthDuration = function (yearMonthDuration1, yearMonthDuration2) {
	const months1 = yearMonthDuration1._isPositive ? yearMonthDuration1._months : -yearMonthDuration1._months;
	const months2 = yearMonthDuration2._isPositive ? yearMonthDuration2._months : -yearMonthDuration2._months;
	return months1 / months2;
};

/**
 * @static
 * @param   {number}  years
 * @param   {number}  months
 * @param   {boolean} isPositive
 * @return  {YearMonthDuration}
 */
YearMonthDuration.fromParts = function (years, months, isPositive) {
	return new YearMonthDuration(years * 12 + months, isPositive);
};

/**
 * @static
 * @param   {string}  string
 * @return  {?YearMonthDuration}
 */
YearMonthDuration.fromString = function (string) {
	const regex = /^(-)?P(\d+Y)?(\d+M)?(\d+D)?(?:T(\d+H)?(\d+M)?(\d+(\.\d*)?S)?)?$/;
	const match = regex.exec(string);

	if (!match) {
		return null;
	}

	const isPositive = !match[1];
	const years = match[2] ? parseInt(match[2], 10) : 0;
	const months = match[3] ? parseInt(match[3], 10) : 0;

	return YearMonthDuration.fromParts(years, months, isPositive);
};

export default YearMonthDuration;
