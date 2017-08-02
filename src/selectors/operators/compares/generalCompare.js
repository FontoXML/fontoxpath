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
 * @return  {!Sequence}
*/
export default function generalCompare (operator, firstSequence, secondSequence) {
    // Change operator to equivalent valueCompare operator
    operator = OPERATOR_TRANSLATION[operator];

	return secondSequence.mapAll(
		allSecondValues =>
			firstSequence.filter(firstValue => {
				for (let i = 0, l = allSecondValues.length; i < l; ++i) {
					if (valueCompare(operator, firstValue, allSecondValues[i])) {
						return true;
					}
				}
				return false;
			}).switchCases({
				empty: () => Sequence.singletonFalseSequence(),
				default: () => Sequence.singletonTrueSequence()
			}));

}
