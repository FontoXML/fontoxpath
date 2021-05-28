import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './annotateAST';

/**
 * Inserts an integer sequence into the AST for the rangeSequenceExpr node.
 * @param ast the AST to be annotated.
 * @returns an integer sequence.
 */
export function annotateRangeSequenceOperator(ast: IAST, context: AnnotationContext): SequenceType {
	const seqType = {
		type: ValueType.XSINTEGER,
		mult: SequenceMultiplicity.ONE_OR_MORE,
	};

	context.totalAnnotated[context.totalAnnotated.length - 1]++;
	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
