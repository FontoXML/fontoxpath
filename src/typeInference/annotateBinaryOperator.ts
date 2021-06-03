import {
	SequenceMultiplicity,
	SequenceType,
	sequenceTypeToString,
	ValueType,
} from '../expressions/dataTypes/Value';
import {
	generateBinaryOperatorType,
} from '../expressions/operators/arithmetic/BinaryOperator';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotationContext';

/**
 * Annotate the binary operators on the numeric and date types
 * by inserting a new attribute `type` to the AST.
 *
 * @param ast the AST to be annotated.
 * @param left the left hand side operand.
 * @param right the right hand side operand.
 * @param operator addOp, subtractOp, divOp, idivOp, modOp, multiplyOp.
 * @throws Error when multiplicities of the operands don't match.
 * @throws Error XPTY0004 when operators cannot be applied on operands.
 * @returns the inferred type or `undefined` when missing operand(s).
 */
export function annotateBinOp(
	ast: IAST,
	left: SequenceType | undefined,
	right: SequenceType | undefined,
	operator: string,
	context: AnnotationContext
): SequenceType | undefined {
	// If we don't have the left and right type, we cannot infer the current type
	if (!left || !right) {
		const itemReturn = {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
		astHelper.insertAttribute(ast, 'type', itemReturn);
		return itemReturn;
	}

	// TODO: Fix this hack (pathExpr returns a node in 1 case, which cannot be added to an integer)
	if (left.type === ValueType.NODE || right.type === ValueType.NODE) return undefined;
	if (left.type === ValueType.ITEM || right.type === ValueType.ITEM) return undefined;

	const funcData = generateBinaryOperatorType(operator, left.type, right.type);

	if (funcData !== undefined) {
		const type = { type: funcData, mult: left.mult };

		astHelper.insertAttribute(ast, 'type', type);
		return type;
	}

	throw new Error(
		`XPTY0004: ${operator} not available for types ${sequenceTypeToString(
			left
		)} and ${sequenceTypeToString(right)}`
	);
}
