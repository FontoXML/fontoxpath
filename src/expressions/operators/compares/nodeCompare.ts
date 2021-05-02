import { compareNodePositions } from '../../dataTypes/documentOrderUtils';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { BaseType } from '../../dataTypes/Value';
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
							!isSubtypeOf(first.type, { kind: BaseType.NODE }) ||
							!isSubtypeOf(second.type, { kind: BaseType.NODE })
						) {
							throw new Error('XPTY0004: Sequences to compare are not nodes');
						}
						switch (operator) {
							case 'isOp':
								return first === second ||
									(first.type.kind === second.type.kind &&
										(first.type.kind === BaseType.ATTRIBUTE ||
											first.type.kind === BaseType.NODE ||
											first.type.kind === BaseType.ELEMENT ||
											first.type.kind === BaseType.DOCUMENTNODE ||
											first.type.kind === BaseType.TEXT ||
											first.type.kind === BaseType.PROCESSINGINSTRUCTION ||
											first.type.kind === BaseType.COMMENT) &&
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
