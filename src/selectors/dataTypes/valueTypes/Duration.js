const monthsToMinMaxValues = [
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

function calculateMinMaxDays (duration) {
	var minNumberOfLeapYears = Math.floor(duration._years / 4),
		maxNumberOfLeapYears = minNumberOfLeapYears + (duration._years % 4 > 0 ? 1 : 0);
	duration._minDays = duration._days +
		(duration._months === 0 ? 0 : monthsToMinMaxValues[duration._months - 1][0]) +
		minNumberOfLeapYears * 366 + (duration._years - minNumberOfLeapYears) * 365;
	duration._maxDays = duration._days +
		(duration._months === 0 ? 0 : monthsToMinMaxValues[duration._months - 1][1]) +
		maxNumberOfLeapYears * 366 + (duration._years - maxNumberOfLeapYears) * 365;
}

function yearMonthDurationToString (duration) {
	const stringValue = `${duration._years ? `${duration._years}Y` : ''}` +
		`${duration._months ? `${duration._months}M` : ''}`;

	return stringValue || '0M';
}

function dayTimeDurationToString (duration) {
	const stringValue = `${duration._days ? `${duration._days}DT` : 'T'}` +
		`${duration._hours ? `${duration._hours}H` : ''}` +
		`${duration._minutes ? `${duration._minutes}M` : ''}` +
		`${duration._seconds || duration._secondFraction ? `${duration._seconds + duration._secondFraction}S` : ''}`;

	return stringValue === 'T' ? 'T0S' : stringValue;
}

class Duration {
	constructor (years, months, days, hours, minutes, seconds, secondFraction, isPositive) {
		this._years = years || 0;
		this._months = months || 0;
		this._days = days || 0;
		this._hours = hours || 0;
		this._minutes = minutes || 0;
		this._seconds = seconds || 0;
		this._secondFraction = secondFraction || 0;
		this._isPositive = isPositive;
		this._minDays = null;
		this._maxDays = null;

		// Normalize values
		this._minutes += Math.floor(this._seconds / 60);
		this._seconds = this._seconds % 60;

		this._hours += Math.floor(this._minutes / 60);
		this._minutes = this._minutes % 60;

		this._days += Math.floor(this._hours / 24);
		this._hours = this._hours % 24;

		this._years += Math.floor(this._months / 12);
		this._months = this._months % 12;

		calculateMinMaxDays(this);
	}

	toDayTime () {
		this._years = 0;
		this._months = 0;

		calculateMinMaxDays(this);
		return this;
	}

	toYearMonth () {
		this._days = 0;
		this._hours = 0;
		this._minutes = 0;
		this._seconds = 0;
		this._secondFraction = 0;

		calculateMinMaxDays(this);
		return this;
	}

	// Returns 1 if this > other, 0 if this === other, -1 if this < other, undefined if this <> other
	compare (other) {
		if (this._isPositive && !other._isPositive) {
			return 1;
		}

		if (!this._isPositive && other._isPositive) {
			return -1;
		}

		var bothPositive = this._isPositive && other._isPositive;
		if (this._maxDays === other._maxDays && this._minDays === other._minDays) {
			var fields = [
				[this._hours, other._hours],
				[this._minutes, other._minutes],
				[this._seconds, other._seconds],
				[this._secondFraction, other._secondFraction]
			];

			for (var i = 0; i < 4; i++) {
				if (fields[i][0] > fields[i][1]) {
					return bothPositive ? 1 : -1;
				}

				if (fields[i][0] < fields[i][1]) {
					return bothPositive ? -1 : 1;
				}
			}

			return 0;
		}

		if (this._minDays > other._maxDays) {
			return bothPositive ? 1 : -1;
		}

		if (this._maxDays < other._minDays) {
			return bothPositive ? -1 : 1;
		}

		return undefined;
	}

	buildString (as) {
		const string = (this._isPositive ? 'P' : '-P');

		if (as === 'xs:duration') {
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

		if (as === 'xs:yearMonthDuration') {
			return string + yearMonthDurationToString(this);
		}

		if (as === 'xs:dayTimeDuration') {
			return string + dayTimeDurationToString(this);
		}

		throw new Error(`Unsupported type ${as} in Duration.toString(as)`);
	}

}

/**
 * @param   {string}  string
 * @param   {string}  as
 * @return  {?Duration}
 */
Duration.fromString = function (string, as) {
	const regEx = /^(-)?P(\d+Y)?(\d+M)?(\d+D)?(?:T(\d+H)?(\d+M)?(\d+(\.\d*)?S)?)?$/;
	const match = regEx.exec(string);

	if (!match) {
		return null;
	}

	const isPositive = !match[1];
	const years = match[2] && parseInt(match[2], 10);
	const months = match[3] && parseInt(match[3], 10);
	const days = match[4] && parseInt(match[4], 10);
	const hours = match[5] && parseInt(match[5], 10);
	const minutes = match[6] && parseInt(match[6], 10);
	const seconds = match[7] && parseInt(match[7], 10);
	const secondFraction = match[8] && parseFloat(match[8]);

	if (as === 'xs:dayTimeDuration') {
		if (years !== undefined || months !== undefined) {
			return null;
		}
		return new Duration(0, 0, days, hours, minutes, seconds, secondFraction, isPositive);
	}
	if (as === 'xs:yearMonthDuration') {
		if (hours !== undefined || minutes !== undefined || seconds !== undefined || secondFraction !== undefined) {
			return null;
		}
		return new Duration(years, months, 0, 0, 0, 0, 0, isPositive);
	}

	return new Duration(years, months, days, hours, minutes, seconds, secondFraction, isPositive);
};

export default Duration;
