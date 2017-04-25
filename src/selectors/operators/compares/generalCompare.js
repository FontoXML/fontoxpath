import Sequence from '../../dataTypes/Sequence';
import DynamicContext from '../../DynamicContext';
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
 * @param   {!DynamicContext}  dynamicContext
 * @return  {!boolean}
*/
export default function generalCompare (operator, firstSequence, secondSequence, dynamicContext) {
    // Atomize both sequences
    var firstAtomizedSequence = firstSequence.atomize(dynamicContext);
    var secondAtomizedSequence = secondSequence.atomize(dynamicContext);

    // Change operator to equivalent valueCompare operator
    operator = OPERATOR_TRANSLATION[operator];

	const firstIterator = firstAtomizedSequence.value();
	const secondSequenceValues = secondAtomizedSequence.getAllValues().map(item => Sequence.singleton(item));

	for (let firstAtomizedValue = firstIterator.next(); !firstAtomizedValue.done; firstAtomizedValue = firstIterator.next()) {
        var firstSingletonSequence = Sequence.singleton(firstAtomizedValue.value);
        for (let i = 0, l = secondSequenceValues.length; i < l; ++i) {
            if (valueCompare(operator, firstSingletonSequence, secondSequenceValues[i])) {
				return true;
			}
        }
    }
	return false;
}
