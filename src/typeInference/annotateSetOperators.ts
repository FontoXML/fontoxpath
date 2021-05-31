import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Annotates the union, intersect and except operators with a sequence of nodes.
 * @param ast the AST to be annotated.
 * @param left the first sequence of nodes.
 * @param right the second sequence of nodes.
 * @returns undefined if either left or right is null of if one of them is not a node.
 * Or it calls the union, intercept or except functions separately.
 */
export function annotateSetOperator(
	ast: IAST,
	left: SequenceType,
	right: SequenceType
): SequenceType | undefined {
	if (!left || !right) return undefined;
	if (left.type !== ValueType.NODE || right.type !== ValueType.NODE) {
		return undefined;
	}

	switch (ast[0]) {
		case 'unionOp':
			return annotateUnionOperator(ast);
		case 'intersectOp':
			return annotateIntersectOperator(ast);
		case 'exceptOp':
			return annotateExceptOperator(ast);
	}
}

function annotateUnionOperator(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.NODE,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}

function annotateIntersectOperator(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.NODE,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}

function annotateExceptOperator(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.NODE,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}
