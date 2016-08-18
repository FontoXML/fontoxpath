define([
	'../../dataTypes/Sequence',
	'../../dataTypes/UntypedAtomicValue',
	'../../dataTypes/StringValue',
	'../../dataTypes/FloatValue',
	'../../dataTypes/DoubleValue'
], function (
	Sequence,
	UntypedAtomicValue,
	StringValue,
	FloatValue,
	DoubleValue
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
			if ((firstValue.primitiveType === 'xs:string' || firstValue.primitiveType === 'xs:anyURI') &&
				(secondValue.primitiveType === 'xs:string' || secondValue.primitiveType === 'xs:anyURI')) {
				firstValue = StringValue.cast(firstValue);
				secondValue = StringValue.cast(secondValue);
			}
			else if ((firstValue.primitiveType === 'xs:decimal' || firstValue.primitiveType === 'xs:float') &&
					(secondValue.primitiveType === 'xs:decimal' || secondValue.primitiveType === 'xs:float')) {
				firstValue = FloatValue.cast(firstValue);
				secondValue = FloatValue.cast(secondValue);
			}
			else if ((firstValue.primitiveType === 'xs:decimal' || firstValue.primitiveType === 'xs:float' || firstValue.primitiveType === 'xs:double') &&
					(secondValue.primitiveType === 'xs:decimal' || secondValue.primitiveType === 'xs:float' || secondValue.primitiveType === 'xs:double')) {
				firstValue = DoubleValue.cast(firstValue);
				secondValue = DoubleValue.cast(secondValue);
			}
			else {
				throw new Error('ERRXPTY0004: Values to compare are not of the same type');
			}
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
			case 'ge':
				return firstValue.value >= secondValue.value;
		}
	};
});
