import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotationContext';

/**
 * Switch cases that take care of the operators under the logical operator category.
 *
 * @param ast The AST to annotate.
 */
export function annotateLogicalOperator(ast: IAST, context: AnnotationContext): SequenceType {
	switch (ast[0]) {
		case 'andOp':
			return annotateAndOperator(ast, context);
		case 'orOp':
			return annotateOrOperator(ast, context);
	}
}

/**
 * Inserts a boolean type to the AST, as or operator returns boolean type.
 *
 * @param ast the AST to be annotated.
 * @returns `SequenceType` of type boolean and multiplicity of `Exactly_ONE`.
 */
function annotateOrOperator(ast: IAST, context: AnnotationContext): SequenceType {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}

/**
 * Inserts a boolean type to the AST, as and operator returns boolean type.
 *
 * @param ast the AST to be annotated.
 * @returns `SequenceType` of type boolean and multiplicity of `Exactly_ONE`.
 */
function annotateAndOperator(ast: IAST, context: AnnotationContext): SequenceType {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
