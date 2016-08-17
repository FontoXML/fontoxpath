define([
	'../../dataTypes/Sequence',
	'../../dataTypes/UntypedAtomicValue',
	'../../dataTypes/StringValue',
	'../../dataTypes/BooleanValue'
], function (
	Sequence,
	UntypedAtomicValue,
	StringValue,
	BooleanValue
) {
	'use strict';

	return function valueCompare (operator, firstSequence, secondSequence) {
		// https://www.w3.org/TR/xpath-3/#doc-xpath31-ValueComp
		if (firstSequence.isEmpty() || secondSequence.isEmpty()) {
			return Sequence.emptySequence();
		}
		if (!firstSequence.isSingleton() || !secondSequence.isSingleton()) {
			throw new Error('ERRXPTY0004: Sequences to compare are not singleton');
		}

		var firstValue = firstSequence.value[0],
			secondValue = secondSequence.value[0];

		if (firstValue instanceof UntypedAtomicValue) {
			firstValue = StringValue.cast(firstValue);
		}

		if (secondValue instanceof UntypedAtomicValue) {
			secondValue = StringValue.cast(secondValue);
		}

		if (firstValue.primitiveType !== secondValue.primitiveType) {
			// TODO: huge casting shite
			throw new Error('ERRXPTY0004: Values to compare are not of the same type');
		}

		switch (operator) {
			case 'eq':
				return firstValue.value === secondValue.value;
			case 'ne':
				return firstValue.value !== secondValue.value;
			case 'lt':
				return firstValue.value < secondValue.value;
			case 'le':
				return firstValue.value <= secondValue.value;
			case 'gt':
				return firstValue.value > secondValue.value;
			case 'gte':
				return firstValue.value >= secondValue.value;
		}
	};
});
