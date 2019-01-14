import AbstractDuration from './AbstractDuration';

class YearMonthDuration extends AbstractDuration {
	public static fromParts: (years: any, months: any, isPositive: any) => YearMonthDuration;
	public static fromString: (string: any) => YearMonthDuration;
	private _months: number;
	constructor(months) {
		super();

		if (months > Number.MAX_SAFE_INTEGER || months < Number.MIN_SAFE_INTEGER) {
			throw new Error(
				'FODT0002: Number of months given to construct YearMonthDuration overflows MAX_SAFE_INTEGER or MIN_SAFE_INTEGER'
			);
		}

		this._months = months;
	}

	public getMonths() {
		const result = this._months % 12;
		return result === 0 ? 0 : result;
	}

	public getRawMonths() {
		return this._months;
	}

	public getYears() {
		return Math.trunc(this._months / 12);
	}

	public isPositive() {
		return Object.is(-0, this._months) ? false : this._months >= 0;
	}

	public toString() {
		return (this.isPositive() ? 'P' : '-P') + this.toStringWithoutP();
	}

	public toStringWithoutP() {
		const years = Math.abs(this.getYears());
		const months = Math.abs(this.getMonths());
		const stringValue = `${years ? `${years}Y` : ''}` + `${months ? `${months}M` : ''}`;

		return stringValue || '0M';
	}
}

YearMonthDuration.fromParts = function(
	years: number,
	months: number,
	isPositive: boolean
): YearMonthDuration {
	const totalMonths = years * 12 + months;
	if (totalMonths > Number.MAX_SAFE_INTEGER || !Number.isFinite(totalMonths)) {
		throw new Error('FODT0002: Value overflow while constructing xs:yearMonthDuration');
	}
	return new YearMonthDuration(isPositive || totalMonths === 0 ? totalMonths : -totalMonths);
};

YearMonthDuration.fromString = function(string: string): YearMonthDuration | null {
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

export function lessThan(
	yearMonthDuration1: YearMonthDuration,
	yearMonthDuration2: YearMonthDuration
): boolean {
	return yearMonthDuration1._months < yearMonthDuration2._months;
}

export function greaterThan(
	yearMonthDuration1: YearMonthDuration,
	yearMonthDuration2: YearMonthDuration
): boolean {
	return yearMonthDuration1._months > yearMonthDuration2._months;
}

export function add(
	yearMonthDuration1: YearMonthDuration,
	yearMonthDuration2: YearMonthDuration
): YearMonthDuration {
	return new YearMonthDuration(yearMonthDuration1._months + yearMonthDuration2._months);
}

export function subtract(
	yearMonthDuration1: YearMonthDuration,
	yearMonthDuration2: YearMonthDuration
): YearMonthDuration {
	return new YearMonthDuration(yearMonthDuration1._months - yearMonthDuration2._months);
}

export function multiply(yearMonthDuration: YearMonthDuration, double: number): YearMonthDuration {
	if (isNaN(double)) {
		throw new Error('FOCA0005: Cannot multiply xs:yearMonthDuration by NaN');
	}
	const result = Math.round(yearMonthDuration._months * double);
	if (result > Number.MAX_SAFE_INTEGER || !Number.isFinite(result)) {
		throw new Error('FODT0002: Value overflow while constructing xs:yearMonthDuration');
	}
	return new YearMonthDuration(result < Number.MIN_SAFE_INTEGER || result === 0 ? 0 : result);
}

export function divide(yearMonthDuration: YearMonthDuration, double: number): YearMonthDuration {
	if (isNaN(double)) {
		throw new Error('FOCA0005: Cannot divide xs:yearMonthDuration by NaN');
	}
	const result = Math.round(yearMonthDuration._months / double);
	if (result > Number.MAX_SAFE_INTEGER || !Number.isFinite(result)) {
		throw new Error('FODT0002: Value overflow while dividing xs:yearMonthDuration');
	}
	return new YearMonthDuration(result < Number.MIN_SAFE_INTEGER || result === 0 ? 0 : result);
}

export function divideByYearMonthDuration(
	yearMonthDuration1: YearMonthDuration,
	yearMonthDuration2: YearMonthDuration
): number {
	return yearMonthDuration1._months / yearMonthDuration2._months;
}

export default YearMonthDuration;
