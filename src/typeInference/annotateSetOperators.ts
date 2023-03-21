import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Annotates the union, intersect and except operators with a sequence of nodes.
 *
 * @param ast the AST to be annotated.
 * @returns a SequenceType of type NODE and of multiplicity EXACTLY_ONE
 */
export function annotateSetOperator(ast: IAST): SequenceType {
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
