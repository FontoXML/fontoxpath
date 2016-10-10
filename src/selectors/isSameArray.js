define([
], function (
) {
	'use strict';

	return function isSameAttributeValues (values1, values2) {
		if (values1 === values2) {
			return true;
		}
		if (values1.length !== values2.length) {
			return false;
		}

		// The values are sorted, so a simple a[i] === b[i] is sufficient
		return values1.every(function (value, i) {
			return values2[i] === value;
		});
	};
});
