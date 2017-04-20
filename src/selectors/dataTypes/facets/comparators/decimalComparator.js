/**
 * @param  {string} fractionString
 * @param  {number} maxLength
 */
function padFraction (fractionString, maxLength) {
	return fractionString.padEnd(maxLength, '0');
}

export default function decimalComparator (value1, value2) {
	if ((value1 === '0' || value1 === '-0') &&
		(value2 === '0' || value2 === '-0')) {
		return 0;
	}

	const regex = /(?:\+|(-))?(\d+)?(?:\.(\d+))?/;
	const match1 = regex.exec(value1 + '');
	const match2 = regex.exec(value2 + '');

	const positive1 = !match1[1];
	const positive2 = !match2[1];
	const val1 = (match1[2] || '').replace(/^0*/, '');
	const val2 = (match2[2] || '').replace(/^0*/, '');
	const fraction1 = match1[3] || '';
	const fraction2 = match2[3] || '';

	if (positive1 && !positive2) {
		return 1;
	}
	if (!positive1 && positive2) {
		return -1;
	}

	const bothPositive = positive1 && positive2;
	if (val1.length > val2.length) {
		return bothPositive ? 1 : -1;
	}
	if (val1.length < val2.length) {
		return bothPositive ? -1 : 1;
	}

	if (val1 > val2) {
		return bothPositive ? 1 : -1;
	}
	if (val1 < val2) {
		return bothPositive ? -1 : 1;
	}

	const maxLengthFractions = Math.max(fraction1.length, fraction2.length);
	const paddedFraction1 = padFraction(fraction1, maxLengthFractions);
	const paddedFraction2 = padFraction(fraction2, maxLengthFractions);

	if (paddedFraction1 > paddedFraction2) {
		return bothPositive ? 1 : -1;
	}
	if (paddedFraction1 < paddedFraction2) {
		return bothPositive ? -1 : 1;
	}

	return 0;
}
