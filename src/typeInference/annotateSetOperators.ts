import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

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
