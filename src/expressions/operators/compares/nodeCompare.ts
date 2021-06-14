import DomFacade from '../../../domFacade/DomFacade';
import DynamicContext from '../../../expressions/DynamicContext';
import { compareNodePositions } from '../../dataTypes/documentOrderUtils';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import { ValueType } from '../../dataTypes/Value';
import arePointersEqual from './arePointersEqual';

export default function nodeCompare(
	operator: string,
	domFacade: DomFacade,
	first: ValueType,
	second: ValueType
): (a: ISequence, b: ISequence, context: DynamicContext) => boolean {
	// https://www.w3.org/TR/xpath-31/#doc-xpath31-NodeComp

	if (!isSubtypeOf(first, ValueType.NODE) || !isSubtypeOf(second, ValueType.NODE)) {
		throw new Error('XPTY0004: Sequences to compare are not nodes');
	}

	switch (operator) {
		case 'isOp':
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
				return (a: ISequence, b: ISequence, _context: DynamicContext) => {
					return arePointersEqual(a.first().value, b.first().value);
				};
			} else {
				return (a: ISequence, b: ISequence) => false;
			}

		case 'nodeBeforeOp':
			if (!domFacade) {
				return undefined;
			}
			return (a, b) => {
				return compareNodePositions(domFacade, a.first(), b.first()) < 0;
			};

		case 'nodeAfterOp':
			if (!domFacade) {
				return undefined;
			}
			return (a, b) => {
				return compareNodePositions(domFacade, a.first(), b.first()) > 0;
			};

		default:
			throw new Error('Unexpected operator');
	}
}
