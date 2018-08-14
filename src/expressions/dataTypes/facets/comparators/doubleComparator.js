export default function doubleComperator (value1, value2) {
	if (value1 === 'NaN' || value2 === 'NaN') {
		return undefined;
	}

	if (value1 === value2) {
		return 0;
	}

	if (value1 === 'INF' || value2 === '-INF') {
		return 1;
	}
	if (value1 === '-INF' || value2 === 'INF') {
		return -1;
	}

	var floatValue1 = parseFloat(value1),
		floatValue2 = parseFloat(value2);
	if (floatValue1 > floatValue2) {
		return 1;
	}
	if (floatValue1 < floatValue2) {
		return -1;
	}

	return 0;
};
