import DomFacade from '../../../domFacade/DomFacade';
import DynamicContext from '../../../expressions/DynamicContext';
import { compareNodePositions } from '../../dataTypes/documentOrderUtils';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import { ValueType } from '../../dataTypes/Value';
import arePointersEqual from './arePointersEqual';

/**
 * Takes in the type of two nodes and its context and returns the node comparison function;
 * Using the inferred types we return the function that we can execute.
 *
 * @param operator The operator that has to be carried out.
 * @param domFacade domFacade.
 * @param first to be compared.
 * @param second to be compared.
 * @returns Comparison function
 */
export default function nodeCompare(
	operator: string,
	domFacade: DomFacade,
	first: ValueType,
	second: ValueType
): (firstSequence: ISequence, secondSequence: ISequence, context: DynamicContext) => boolean {
	// https://www.w3.org/TR/xpath-31/#doc-xpath31-NodeComp

	if (!isSubtypeOf(first, ValueType.NODE) || !isSubtypeOf(second, ValueType.NODE)) {
		throw new Error('XPTY0004: Sequences to compare are not nodes');
	}

	switch (operator) {
		case 'isOp':
			return isOpHandler(first, second);

		case 'nodeBeforeOp':
			if (!domFacade) {
				return undefined;
			}
			return (firstSequenceParam, secondSequenceParam) => {
				return (
					compareNodePositions(
						domFacade,
						firstSequenceParam.first(),
						secondSequenceParam.first()
					) < 0
				);
			};

		case 'nodeAfterOp':
			if (!domFacade) {
				return undefined;
			}
			return (firstSequenceParam, secondSequenceParam) => {
				return (
					compareNodePositions(
						domFacade,
						firstSequenceParam.first(),
						secondSequenceParam.first()
					) > 0
				);
			};

		default:
			throw new Error('Unexpected operator');
	}
}

function isOpHandler(
	first: ValueType,
	second: ValueType
): (
	firstSequence: ISequence,
	secondSequence: ISequence,
	dynamicContext: DynamicContext
) => boolean {
	if (
		first === second &&
		(first === ValueType.ATTRIBUTE ||
			first === ValueType.NODE ||
			first === ValueType.ELEMENT ||
			first === ValueType.DOCUMENTNODE ||
			first === ValueType.TEXT ||
			first === ValueType.PROCESSINGINSTRUCTION ||
			first === ValueType.COMMENT)
	) {
		return (
			firstSequenceParam: ISequence,
			secondSequenceParam: ISequence,
			_context: DynamicContext
		) => {
			return arePointersEqual(
				firstSequenceParam.first().value,
				secondSequenceParam.first().value
			);
		};
	} else {
		return (firstSequenceParam: ISequence, secondSequenceParam: ISequence) => false;
	}
}
