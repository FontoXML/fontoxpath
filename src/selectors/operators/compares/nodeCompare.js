import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import Sequence from '../../dataTypes/Sequence';
import zipSingleton from '../../util/zipSingleton';
import { compareNodePositions } from '../../dataTypes/documentOrderUtils';

/**
 * @param   {string}     operator
 * @param   {!../../dataTypes/Sequence}  firstSequence
 * @param   {!../../dataTypes/Sequence}  secondSequence
 * @return  {!Sequence}
 */
export default function nodeCompare (operator, domFacade, firstSequence, secondSequence) {
	// https://www.w3.org/TR/xpath-31/#doc-xpath31-NodeComp
	return firstSequence.switchCases({
		default: () => {
			throw new Error('XPTY0004: Sequences to compare are not singleton');
		},
		singleton: () => secondSequence.switchCases({
			default: () => {
				throw new Error('XPTY0004: Sequences to compare are not singleton');
			},
			singleton: () => {

			return zipSingleton(
				[firstSequence, secondSequence],
				([first, second]) => {
					if (!isSubtypeOf(first.type, 'node()') || !isSubtypeOf(second.type, 'node()')) {
						throw new Error('XPTY0004: Sequences to compare are not nodes');
					}
				switch (operator) {
					case 'is':
						return first === second ?
							Sequence.singletonTrueSequence() :
							Sequence.singletonFalseSequence();

					case '<<':
						return compareNodePositions(domFacade, first, second) < 0 ?
							Sequence.singletonTrueSequence() :
							Sequence.singletonFalseSequence();

					case '>>':
						return compareNodePositions(domFacade, first, second) > 0 ?
							Sequence.singletonTrueSequence() :
							Sequence.singletonFalseSequence();

					default:
						throw new Error('Unexpected operator');
				}
			});
			}
		})
	});
}
