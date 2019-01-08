abstract class AbstractDuration {
	getRawMonths () {
		return 0;
	}

	getRawSeconds () {
		return 0;
	}

	getYears () {
		return 0;
	}

	getMonths () {
		return 0;
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
		return true;
	}

	equals (other) {
		return this.getRawMonths() === other.getRawMonths() &&
			this.getRawSeconds() === other.getRawSeconds();
	}
}

export default AbstractDuration;
