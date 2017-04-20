// TODO: duplicate of same function in DateTime.js
function convertToTwoCharString (value) {
	const string = value + '';
	return string.padStart(2, '0');
}

// Input like: +10:00, Z, +00:00, -00:00, +04:30
// Hours limited to max 14, see: https://www.w3.org/TR/xmlschema-2/ @ 3.2.7.3 Timezones
class Timezone {
	constructor (isPositive, hours, minutes) {
		this._hours = hours;
		this._minutes = minutes;
		this._isPositive = hours === 0 && minutes === 0 ? true : isPositive;
	}

	equals (other) {
		return this._hours === other._hours &&
			this._minutes === other._minutes &&
			this._isPositive === other._isPositive;
	}

	isUTC () {
		return this._hours === 0 && this._minutes === 0;
	}

	getHours () {
		return this._hours;
	}

	getMinutes () {
		return this._minutes;
	}

	isPositive () {
		return this._isPositive;
	}

	// 'Z' | ('+' | '-') (('0' digit | '1' [0-3]) ':' minuteFrag | '14:00')
	toString () {
		if (this._hours === 0 && this._minutes === 0) {
			return 'Z';
		}

		return (this._isPositive ? '+' : '-') +
			convertToTwoCharString(this._hours) + ':' +
			convertToTwoCharString(this._minutes);
	}
}

Timezone.fromString = function (string) {
	var regex = /^(Z)|([+-])([01]\d):([0-5]\d)$/,
	match = regex.exec(string);

	if (match[1] === 'Z') {
		return new Timezone(true, 0, 0);
	}

	var isPositive = match[2] === '+',
		hours = parseInt(match[3], 10),
		minutes = parseInt(match[4], 10);

	return new Timezone(isPositive, hours, minutes);
};

export default Timezone;
