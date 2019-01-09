import AbstractDuration from './AbstractDuration';
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
	const years = Math.abs(duration.getYears());
	const months = Math.abs(duration.getMonths());
	const minNumberOfLeapYears = Math.floor(years / 4);

	return Math.abs(duration.getDays()) +
		(months === 0 ? 0 : MONTHS_TO_MIN_MAX_VALUES[months - 1][0]) +
		minNumberOfLeapYears * 366 + (years - minNumberOfLeapYears) * 365;
}

function computeMaxDays (duration) {
	const years = Math.abs(duration.getYears());
	const months = Math.abs(duration.getMonths());
	const maxNumberOfLeapYears = Math.ceil(years / 4);

	return Math.abs(duration.getDays()) +
		(months === 0 ? 0 : MONTHS_TO_MIN_MAX_VALUES[months - 1][1]) +
		maxNumberOfLeapYears * 366 + (years - maxNumberOfLeapYears) * 365;
}

class Duration extends AbstractDuration {
	_yearMonthDuration: YearMonthDuration;
	_dayTimeDuration: DayTimeDuration;
	static fromString: (string: any) => Duration;
	static fromYearMonthDuration: (yearMonthDuration: any) => Duration;
	static fromDayTimeDuration: (dayTimeDuration: any) => Duration;
	constructor (yearMonthDuration, dayTimeDuration) {
		super();

		this._yearMonthDuration = yearMonthDuration;
		this._dayTimeDuration = dayTimeDuration;
	}

	getRawMonths () {
		return this._yearMonthDuration.getRawMonths();
	}

	getRawSeconds () {
		return this._dayTimeDuration.getRawSeconds();
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
		return this._yearMonthDuration.isPositive() && this._dayTimeDuration.isPositive();
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

		const thisMinDays = computeMinDays(this);
		const thisMaxDays = computeMaxDays(this);
		const otherMinDays = computeMinDays(other);
		const otherMaxDays = computeMaxDays(other);

		if (thisMinDays === otherMinDays && thisMaxDays === otherMaxDays) {
			const thisSecondsWithoutDays = this.getHours() * 3600 + this.getMinutes() * 60 + this.getSeconds();
			const otherSecondsWithoutDays = other.getHours() * 3600 + other.getMinutes() * 60 + other.getSeconds();
			if (thisSecondsWithoutDays > otherSecondsWithoutDays) {
				return 1;
			}

			if (thisSecondsWithoutDays < otherSecondsWithoutDays) {
				return -1;
			}

			return 0;
		}

		const bothPositive = this.isPositive() && other.isPositive();
		if (thisMinDays > otherMaxDays) {
			return bothPositive ? 1 : -1;
		}

		if (thisMaxDays < otherMinDays) {
			return bothPositive ? -1 : 1;
		}
	}

	toString () {
		const string = this.isPositive() ? 'P' : '-P';
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

Duration.fromString = function (string: string): Duration | null {
	return new Duration(
			YearMonthDuration.fromString(string),
			DayTimeDuration.fromString(string));
};

Duration.fromYearMonthDuration = function (yearMonthDuration: YearMonthDuration): Duration {
	return new Duration(yearMonthDuration, new DayTimeDuration(yearMonthDuration.isPositive() ? 0 : -0));
};

Duration.fromDayTimeDuration = function (dayTimeDuration: DayTimeDuration): Duration {
	return new Duration(new YearMonthDuration(dayTimeDuration.isPositive() ? 0 : -0), dayTimeDuration);
};

export default Duration;
