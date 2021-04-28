import { compareNodePositions } from '../../dataTypes/documentOrderUtils';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import zipSingleton from '../../util/zipSingleton';
import arePointersEqual from './arePointersEqual';

export default function nodeCompare(
	operator: string,
	domFacade,
	firstSequence: ISequence,
	secondSequence: ISequence
): ISequence {
	// https://www.w3.org/TR/xpath-31/#doc-xpath31-NodeComp
	return firstSequence.switchCases({
		default: () => {
			throw new Error('XPTY0004: Sequences to compare are not singleton');
		},
		singleton: () =>
			secondSequence.switchCases({
				default: () => {
					throw new Error('XPTY0004: Sequences to compare are not singleton');
				},
				singleton: () => {
					return zipSingleton([firstSequence, secondSequence], ([first, second]) => {
						if (
							!isSubtypeOf(first.type, 'node()') ||
							!isSubtypeOf(second.type, 'node()')
						) {
							throw new Error('XPTY0004: Sequences to compare are not nodes');
						}
						switch (operator) {
							case 'isOp':
								return first === second ||
									(first.type === second.type &&
										(first.type === 'attribute()' ||
											first.type === 'node()' ||
											first.type === 'element()' ||
											first.type === 'document-node()' ||
											first.type === 'text()' ||
											first.type === 'processing-instruction()' ||
											first.type === 'comment()') &&
										arePointersEqual(first.value, second.value))
									? sequenceFactory.singletonTrueSequence()
									: sequenceFactory.singletonFalseSequence();

							case 'nodeBeforeOp':
								return compareNodePositions(domFacade, first, second) < 0
									? sequenceFactory.singletonTrueSequence()
									: sequenceFactory.singletonFalseSequence();

							case 'nodeAfterOp':
								return compareNodePositions(domFacade, first, second) > 0
									? sequenceFactory.singletonTrueSequence()
									: sequenceFactory.singletonFalseSequence();

							default:
								throw new Error('Unexpected operator');
						}
					});
				},
			}),
	});
}
