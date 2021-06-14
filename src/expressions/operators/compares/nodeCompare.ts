import DomFacade from '../../../domFacade/DomFacade';
import { compareNodePositions } from '../../dataTypes/documentOrderUtils';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import Value, { ValueType } from '../../dataTypes/Value';
import zipSingleton from '../../util/zipSingleton';
import arePointersEqual from './arePointersEqual';

export default function nodeCompare(
	operator: string,
	domFacade: DomFacade,
	first: ValueType,
	second: ValueType
): (a: Value, b: Value) => boolean {
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
				return (a: Value, b: Value) => {
					return arePointersEqual(a.value, b.value);
				};
			} else {
				return (a: Value, b: Value) => false;
			}

		case 'nodeBeforeOp':
			if (!domFacade) {
				return undefined;
			}
			return (a, b) => {
				return compareNodePositions(domFacade, a, b) < 0;
			};

		case 'nodeAfterOp':
			if (!domFacade) {
				return undefined;
			}
			return (a, b) => {
				return compareNodePositions(domFacade, a, b) > 0;
			};

		default:
			throw new Error('Unexpected operator');
	}
}
