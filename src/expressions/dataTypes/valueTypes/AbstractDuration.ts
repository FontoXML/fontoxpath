abstract class AbstractDuration {
	public equals(other: AbstractDuration) {
		return (
			this.getRawMonths() === other.getRawMonths() &&
			this.getRawSeconds() === other.getRawSeconds()
		);
	}

	public getDays() {
		return 0;
	}

	public getHours() {
		return 0;
	}

	public getMinutes() {
		return 0;
	}

	public getMonths() {
		return 0;
	}
	public getRawMonths() {
		return 0;
	}

	public getRawSeconds() {
		return 0;
	}

	public getSeconds() {
		return 0;
	}

	public getYears() {
		return 0;
	}

	public isPositive() {
		return true;
	}
	public negate() {
		return this;
	}
}

export default AbstractDuration;
