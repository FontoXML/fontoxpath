import { SequenceType, sequenceTypeToString } from '../expressions/dataTypes/Value';
import { getBinaryPrefabOperator } from '../expressions/operators/arithmetic/BinaryOperator';
import astHelper, { IAST } from '../parsing/astHelper';

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
	operator: string
): SequenceType | undefined {
	// If we don't have the left and right type, we cannot infer the current type
	if (!left || !right) {
		return undefined;
	}

	// If the multiplicities don't match, we can't add them
	if (left.mult !== right.mult) {
		throw new Error("Multiplicities in binary addition operator don't match");
	}

	const funcData = getBinaryPrefabOperator(left.type, right.type, operator);

	if (funcData) {
		const type = { type: funcData[1], mult: left.mult };
		astHelper.insertAttribute(ast, 'type', type);
		return type;
	}

	throw new Error(
		`XPTY0004: ${operator} not available for types ${sequenceTypeToString(
			left
		)} and ${sequenceTypeToString(right)}`
	);
}
