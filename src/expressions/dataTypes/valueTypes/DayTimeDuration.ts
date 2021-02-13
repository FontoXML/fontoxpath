import AbstractDuration from './AbstractDuration';

class DayTimeDuration extends AbstractDuration {
	public static fromJavascriptDateTimezone: (date: any) => DayTimeDuration;
	public static fromParts: (
		days: any,
		hours: any,
		minutes: any,
		seconds: any,
		secondFraction: any,
		isPositive: any
	) => DayTimeDuration;
	public static fromString: (str: string) => DayTimeDuration;
	public static fromTimezoneString: (str: string) => DayTimeDuration;
	public seconds: number;
	constructor(seconds: number) {
		super();

		if (seconds > Number.MAX_SAFE_INTEGER || seconds < Number.MIN_SAFE_INTEGER) {
			throw new Error(
				'FODT0002: Number of seconds given to construct DayTimeDuration overflows MAX_SAFE_INTEGER or MIN_SAFE_INTEGER'
			);
		}

		this.seconds = seconds;
	}

	public getDays() {
		return Math.trunc(this.seconds / 86400);
	}

	public getHours() {
		return Math.trunc((this.seconds % 86400) / 3600);
	}

	public getMinutes() {
		return Math.trunc((this.seconds % 3600) / 60);
	}

	public getRawSeconds() {
		return this.seconds;
	}

	public getSeconds() {
		const result = this.seconds % 60;
		return Object.is(-0, result) ? 0 : result;
	}

	public isPositive() {
		return Object.is(-0, this.seconds) ? false : this.seconds >= 0;
	}

	public toString() {
		return (this.isPositive() ? 'P' : '-P') + this.toStringWithoutP();
	}

	public toStringWithoutP() {
		const days = Math.abs(this.getDays());
		const hours = Math.abs(this.getHours());
		const minutes = Math.abs(this.getMinutes());
		const seconds = Math.abs(this.getSeconds());
		const stringValue =
			`${days ? `${days}DT` : 'T'}` +
			`${hours ? `${hours}H` : ''}` +
			`${minutes ? `${minutes}M` : ''}` +
			`${seconds ? `${seconds}S` : ''}`;

		return stringValue === 'T' ? 'T0S' : stringValue;
	}
}

DayTimeDuration.fromParts = (
	days: number,
	hours: number,
	minutes: number,
	seconds: number,
	secondFraction: number,
	isPositive: boolean
): DayTimeDuration => {
	const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds + secondFraction;
	return new DayTimeDuration(isPositive || totalSeconds === 0 ? totalSeconds : -totalSeconds);
};

DayTimeDuration.fromString = (dayTimeDurationString: string): DayTimeDuration | null => {
	const regex = /^(-)?P(\d+Y)?(\d+M)?(\d+D)?(?:T(\d+H)?(\d+M)?(\d+(\.\d*)?S)?)?$/;
	const match = regex.exec(dayTimeDurationString);

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

DayTimeDuration.fromTimezoneString = (timezoneString: string): DayTimeDuration => {
	const regex = /^(Z)|([+-])([01]\d):([0-5]\d)$/;
	const match = regex.exec(timezoneString);

	if (match[1] === 'Z') {
		return DayTimeDuration.fromParts(0, 0, 0, 0, 0, true);
	}

	const isPositive = match[2] === '+';
	const hours = match[3] ? parseInt(match[3], 10) : 0;
	const minutes = match[4] ? parseInt(match[4], 10) : 0;

	return DayTimeDuration.fromParts(0, hours, minutes, 0, 0, isPositive);
};

DayTimeDuration.fromJavascriptDateTimezone = (date: Date): DayTimeDuration => {
	const minutes = date.getTimezoneOffset();
	const isPositive = minutes > -1;

	return DayTimeDuration.fromParts(0, 0, Math.abs(minutes), 0, 0, isPositive);
};

export function lessThan(
	dayTimeDuration1: DayTimeDuration,
	dayTimeDuration2: DayTimeDuration
): boolean {
	return dayTimeDuration1.seconds < dayTimeDuration2.seconds;
}

export function greaterThan(
	dayTimeDuration1: DayTimeDuration,
	dayTimeDuration2: DayTimeDuration
): boolean {
	return dayTimeDuration1.seconds > dayTimeDuration2.seconds;
}

export function add(
	dayTimeDuration1: DayTimeDuration,
	dayTimeDuration2: DayTimeDuration
): DayTimeDuration {
	return new DayTimeDuration(dayTimeDuration1.seconds + dayTimeDuration2.seconds);
}

export function subtract(
	dayTimeDuration1: DayTimeDuration,
	dayTimeDuration2: DayTimeDuration
): DayTimeDuration {
	return new DayTimeDuration(dayTimeDuration1.seconds - dayTimeDuration2.seconds);
}

export function multiply(dayTimeDuration: DayTimeDuration, double: number): DayTimeDuration {
	if (isNaN(double)) {
		throw new Error('FOCA0005: Cannot multiply xs:dayTimeDuration by NaN');
	}
	const result = dayTimeDuration.seconds * double;
	if (result > Number.MAX_SAFE_INTEGER || !Number.isFinite(result)) {
		throw new Error('FODT0002: Value overflow while multiplying xs:dayTimeDuration');
	}
	return new DayTimeDuration(
		result < Number.MIN_SAFE_INTEGER || Object.is(-0, result) ? 0 : result
	);
}

export function divide(dayTimeDuration: DayTimeDuration, double: number): DayTimeDuration {
	if (isNaN(double)) {
		throw new Error('FOCA0005: Cannot divide xs:dayTimeDuration by NaN');
	}
	const result = dayTimeDuration.seconds / double;
	if (result > Number.MAX_SAFE_INTEGER || !Number.isFinite(result)) {
		throw new Error('FODT0002: Value overflow while dividing xs:dayTimeDuration');
	}
	return new DayTimeDuration(
		result < Number.MIN_SAFE_INTEGER || Object.is(-0, result) ? 0 : result
	);
}

export function divideByDayTimeDuration(
	dayTimeDuration1: DayTimeDuration,
	dayTimeDuration2: DayTimeDuration
): number {
	if (dayTimeDuration2.seconds === 0) {
		throw new Error('FOAR0001: Division by 0');
	}
	return dayTimeDuration1.seconds / dayTimeDuration2.seconds;
}

export default DayTimeDuration;
