define([
], function (
) {
	'use strict';

	return function nodeCompare (operator, firstSequence, secondSequence) {
		// https://www.w3.org/TR/xpath-31/#doc-xpath31-NodeComp
		if (!firstSequence.isSingleton() || !secondSequence.isSingleton()) {
			throw new Error('XPTY0004: Sequences to compare are not singleton');
		}

		if (!firstSequence.value[0].instanceOfType('node()') || !secondSequence.value[0].instanceOfType('node()')) {
			throw new Error('XPTY0004: Sequences to compare are not nodes');
		}

		switch (operator) {
			case 'is':
				return firstSequence.value[0] === secondSequence.value[0];
			case '<<':
			case '>>':
				throw new Error('Node ordering comparisons are not implemented.');
		}
	};
});
