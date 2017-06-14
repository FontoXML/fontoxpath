class YearMonthDuration {
	constructor (months) {
		this._months = months;
	}

	getYears () {
		return (this._months / 12) | 0;
	}

	getMonths () {
		const result = this._months % 12;
		return result === 0 ? 0 : result;
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
		return Object.is(-0, this._months) ? false : this._months >= 0;
	}

	equals (other) {
		return this._months === other._months;
	}

	toStringWithoutP () {
		const years = Math.abs(this.getYears());
		const months = Math.abs(this.getMonths());
		const stringValue = `${years ? `${years}Y` : ''}` + `${months ? `${months}M` : ''}`;

		return stringValue || '0M';
	}

	toString () {
		return (this.isPositive() ? 'P' : '-P') + this.toStringWithoutP();
	}
}

/**
 * @static
 * @param   {YearMonthDuration}  yearMonthDuration1
 * @param   {YearMonthDuration}  yearMonthDuration2
 * @return  {boolean}
 */
YearMonthDuration.lessThan = function (yearMonthDuration1, yearMonthDuration2) {
	return yearMonthDuration1._months < yearMonthDuration2._months;
};

/**
 * @static
 * @param   {YearMonthDuration}  yearMonthDuration1
 * @param   {YearMonthDuration}  yearMonthDuration2
 * @return  {boolean}
 */
YearMonthDuration.greaterThan = function (yearMonthDuration1, yearMonthDuration2) {
	return yearMonthDuration1._months > yearMonthDuration2._months;
};

YearMonthDuration.add = function (yearMonthDuration1, yearMonthDuration2) {
	return new YearMonthDuration(yearMonthDuration1._months + yearMonthDuration2._months);
};

YearMonthDuration.subtract = function (yearMonthDuration1, yearMonthDuration2) {
	return new YearMonthDuration(yearMonthDuration1._months - yearMonthDuration2._months);
};

YearMonthDuration.multiply = function (yearMonthDuration, double) {
	if (isNaN(double)) {
		throw new Error('FOCA0005: Cannot multiply xs:yearMonthDuration by NaN');
	}
	const result = Math.round(yearMonthDuration._months * double);
	if (result > Number.MAX_SAFE_INTEGER || !Number.isFinite(result)) {
		throw new Error('FODT0002: Value overflow while constructing xs:yearMonthDuration');
	}
	return new YearMonthDuration(result < Number.MIN_SAFE_INTEGER || result === 0 ? 0 : result);
};

YearMonthDuration.divide = function (yearMonthDuration, double) {
	if (isNaN(double)) {
		throw new Error('FOCA0005: Cannot divide xs:yearMonthDuration by NaN');
	}
	const result = Math.round(yearMonthDuration._months / double);
	if (result > Number.MAX_SAFE_INTEGER || !Number.isFinite(result)) {
		throw new Error('FODT0002: Value overflow while dividing xs:yearMonthDuration');
	}
	return new YearMonthDuration(result < Number.MIN_SAFE_INTEGER || result === 0 ? 0 : result);
};

YearMonthDuration.divideByYearMonthDuration = function (yearMonthDuration1, yearMonthDuration2) {
	return yearMonthDuration1._months / yearMonthDuration2._months;
};

/**
 * @static
 * @param   {number}  years
 * @param   {number}  months
 * @param   {boolean} isPositive
 * @return  {YearMonthDuration}
 */
YearMonthDuration.fromParts = function (years, months, isPositive) {
	const totalMonths = years * 12 + months;
	if (totalMonths > Number.MAX_SAFE_INTEGER || !Number.isFinite(totalMonths)) {
		throw new Error('FODT0002: Value overflow while constructing xs:yearMonthDuration');
	}
	return new YearMonthDuration(isPositive || totalMonths === 0 ? totalMonths : -totalMonths);
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
