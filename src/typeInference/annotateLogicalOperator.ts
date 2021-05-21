import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

export function annotateLogicalOperator(ast: IAST): SequenceType {
	switch (ast[0]) {
		case 'andOp':
			return annotateAndOperator(ast);
		case 'orOp':
			return annotateOrOperator(ast);
	}
}

function annotateOrOperator(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}

function annotateAndOperator(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
