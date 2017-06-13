import isSubtypeOf from '../../dataTypes/isSubtypeOf';
/**
 * @param   {string}     operator
 * @param   {!../../dataTypes/Sequence}  firstSequence
 * @param   {!../../dataTypes/Sequence}  secondSequence
 * @return  {boolean}
 */
export default function nodeCompare (operator, firstSequence, secondSequence) {
	// https://www.w3.org/TR/xpath-31/#doc-xpath31-NodeComp
	if (!firstSequence.isSingleton() || !secondSequence.isSingleton()) {
		throw new Error('XPTY0004: Sequences to compare are not singleton');
	}
	const first = firstSequence.first();
	const second = secondSequence.first();
	if (!isSubtypeOf(first.type, 'node()') || !isSubtypeOf(second.type, 'node()')) {
		throw new Error('XPTY0004: Sequences to compare are not nodes');
	}

	switch (operator) {
		case 'is':
			return first === second;
		case '<<':
		case '>>':
			throw new Error('Node ordering comparisons are not implemented.');
		default:
			throw new Error(`Unknown compare ${operator}`);
	}
};
