import Sequence from '../../dataTypes/Sequence';
import valueCompare from './valueCompare';

var OPERATOR_TRANSLATION = {
    '=': 'eq',
    '>': 'gt',
    '<': 'lt',
    '!=': 'ne',
    '<=': 'le',
    '>=': 'ge'
};

/**
 * @param   {!string}          operator
 * @param   {!Sequence}        firstSequence
 * @param   {!Sequence}        secondSequence
 * @return  {!boolean}
*/
export default function generalCompare (operator, firstSequence, secondSequence) {
    // Change operator to equivalent valueCompare operator
    operator = OPERATOR_TRANSLATION[operator];

	const firstIterator = firstSequence.value();
	const secondSequenceValues = secondSequence.getAllValues();

	for (let firstAtomizedValue = firstIterator.next(); !firstAtomizedValue.done; firstAtomizedValue = firstIterator.next()) {
        for (let i = 0, l = secondSequenceValues.length; i < l; ++i) {
            if (valueCompare(operator, firstAtomizedValue.value, secondSequenceValues[i])) {
				return true;
			}
        }
    }
	return false;
}
