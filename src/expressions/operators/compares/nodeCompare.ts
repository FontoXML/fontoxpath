import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import SequenceFactory from '../../dataTypes/SequenceFactory';
import zipSingleton from '../../util/zipSingleton';
import { compareNodePositions } from '../../dataTypes/documentOrderUtils';
import ISequence from '../../dataTypes/ISequence';

export default function nodeCompare(operator: string, domFacade, firstSequence: ISequence, secondSequence: ISequence): ISequence {
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
					case 'isOp':
						return first === second ?
							SequenceFactory.singletonTrueSequence() :
							SequenceFactory.singletonFalseSequence();

					case 'nodeBeforeOp':
						return compareNodePositions(domFacade, first, second) < 0 ?
							SequenceFactory.singletonTrueSequence() :
							SequenceFactory.singletonFalseSequence();

					case 'nodeAfterOp':
						return compareNodePositions(domFacade, first, second) > 0 ?
							SequenceFactory.singletonTrueSequence() :
							SequenceFactory.singletonFalseSequence();

					default:
						throw new Error('Unexpected operator');
				}
			});
			}
		})
	});
}
