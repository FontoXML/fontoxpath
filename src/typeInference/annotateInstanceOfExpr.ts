import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './annotateAST';

/**
 * Insert type boolean multiplicity exactly one the type to the ast
 * as an attribute, since instance of expression evaluates to a boolean.
 *
 * @param ast the AST to be annotated.
 * @returns the type of the context item.
 */
export function annotateInstanceOfExpr(ast: IAST, context: AnnotationContext): SequenceType {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	context.totalAnnotated[context.totalAnnotated.length - 1]++;
	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
