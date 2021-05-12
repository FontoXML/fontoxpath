import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { SequenceType, ValueType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';

/**
 * Adds the unary minus operator type annotation to the AST
 * The unary minus returns the value of its operand with the sign negated (-2 = -2 and --2 = 2)
 * @param ast A reference to the AST, so a new node can be inserted
 * @param valueType The type of the value that the operator is called on.
 * @returns An appropriate SequenceType if the operation was valid, undefined if not.
 */
export function annotateUnaryMinus(
	ast: IAST,
	valueType: SequenceType | undefined
): SequenceType | undefined {
	if (!valueType) {
		return undefined;
	}

	if (isSubtypeOf(valueType.type, ValueType.XSNUMERIC)) {
		const type = {
			type: valueType.type,
			mult: valueType.mult,
		};
		ast.push(['type', type]);
		return type;
	}

	// TODO: This path does not mean it's invalid per se,
	// documentation states that especially plus is used for casting to a number.
	return undefined;
}

/**
 * Adds the unary plus operator type annotation to the AST.
 * The unary plus returns the value of its operand with the sign unchanged (+2 = 2 and +-2 = -2)
 * @param ast A reference to the AST, so a new node can be inserted
 * @param valueType The type of the value that the operator is called on.
 * @returns An appropriate SequenceType if the operation was valid, undefined if not.
 */
export function annotateUnaryPlus(
	ast: IAST,
	valueType: SequenceType | undefined
): SequenceType | undefined {
	if (!valueType) {
		return undefined;
	}

	if (isSubtypeOf(valueType.type, ValueType.XSNUMERIC)) {
		const type = {
			type: valueType.type,
			mult: valueType.mult,
		};
		ast.push(['type', type]);
		return type;
	}

	// TODO: This path does not mean it's invalid per se,
	return undefined;
}
