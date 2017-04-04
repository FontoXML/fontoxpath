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

    return firstAtomizedSequence.value.some(function (firstValue) {
        var firstSingletonSequence = Sequence.singleton(firstValue);
        return secondAtomizedSequence.value.some(function (secondValue) {
            return valueCompare(operator, firstSingletonSequence, Sequence.singleton(secondValue));
        });
    });
}
