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
		this._seconds = days * 86400 + hours * 3600 + minutes * 60 + seconds + secondFraction;
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
		return Math.floor(this._seconds % 86400 % 3600 / 60);
	}

	getSeconds () {
		return this._seconds % 86400 % 3600 % 60;
	}

	compare (other) {
		if (this._isPositive && !other._isPositive) {
			return 1;
		}

		if (!this._isPositive && other._isPositive) {
			return -1;
		}

		const bothPositive = this._isPositive && other._isPositive;
		if (bothPositive && this._months === other._months && this._seconds === other._seconds) {
			return 0;
		}

		const thisMinDays = computeMinDays(this);
		const thisMaxDays = computeMaxDays(this);
		const otherMinDays = computeMinDays(other);
		const otherMaxDays = computeMaxDays(other);

		if (thisMinDays === otherMinDays && thisMaxDays === otherMaxDays) {
			const thisSecondsWithoutDays = this._seconds % 86400;
			const otherSecondsWithoutDays = other._seconds % 86400;
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
 * @param   {string}  string
 * @param   {string}  type
 * @return  {?Duration}
 */
Duration.fromString = function (string, type = 'xs:duration') {
	const regEx = /^(-)?P(\d+Y)?(\d+M)?(\d+D)?(?:T(\d+H)?(\d+M)?(\d+(\.\d*)?S)?)?$/;
	const match = regEx.exec(string);

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

export default Duration;
