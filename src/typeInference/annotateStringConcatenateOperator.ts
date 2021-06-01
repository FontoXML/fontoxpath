import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './annotateAST';

export function annotateStringConcatenateOperator(
	ast: IAST,
	context: AnnotationContext
): SequenceType | undefined {
	const seqType = {
		type: ValueType.XSSTRING,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}
