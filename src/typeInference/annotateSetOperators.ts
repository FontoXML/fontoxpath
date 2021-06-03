import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotationContext';

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
	right: SequenceType,
	context: AnnotationContext
): SequenceType {
	switch (ast[0]) {
		case 'unionOp':
			return annotateUnionOperator(ast, context);
		case 'intersectOp':
			return annotateIntersectOperator(ast, context);
		case 'exceptOp':
			return annotateExceptOperator(ast, context);
	}
}

function annotateUnionOperator(ast: IAST, context: AnnotationContext): SequenceType {
	const seqType = {
		type: ValueType.NODE,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}

function annotateIntersectOperator(ast: IAST, context: AnnotationContext): SequenceType {
	const seqType = {
		type: ValueType.NODE,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}

function annotateExceptOperator(ast: IAST, context: AnnotationContext): SequenceType {
	const seqType = {
		type: ValueType.NODE,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}
