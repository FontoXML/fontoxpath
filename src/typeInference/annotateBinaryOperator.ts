import {
	SequenceMultiplicity,
	SequenceType,
	sequenceTypeToString,
	ValueType,
} from '../expressions/dataTypes/Value';
import { generateBinaryOperatorType } from '../expressions/operators/arithmetic/BinaryOperator';
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
): SequenceType {
	// If we don't have the left and right type, we cannot infer the current type
	if (!left || !right) {
		return {
			type: ValueType.XSNUMERIC,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		};
	}

	// TODO: Fix this hack (pathExpr returns a node in 1 case, which cannot be added to an integer)
	if (
		[ValueType.NODE, ValueType.ITEM, ValueType.XSANYATOMICTYPE].includes(left.type) ||
		[ValueType.NODE, ValueType.ITEM, ValueType.XSANYATOMICTYPE].includes(right.type)
	) {
		return {
			type: ValueType.XSNUMERIC,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		};
	}

	const valueType = generateBinaryOperatorType(operator, left.type, right.type);

	if (valueType) {
		const type = { type: valueType, mult: left.mult };

		if (valueType !== ValueType.XSNUMERIC) {
			astHelper.insertAttribute(ast, 'type', type);
		}
		return type;
	}

	throw new Error(
		`XPTY0004: ${operator} not available for types ${sequenceTypeToString(
			left
		)} and ${sequenceTypeToString(right)}`
	);
}
