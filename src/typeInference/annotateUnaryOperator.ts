import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Adds the unary minus operator type annotation to the AST
 * The unary minus returns the value of its operand with the sign negated (-2 = -2 and --2 = 2).
 *
 * @param ast A reference to the AST, so a new node can be inserted.
 * @param valueType The type of the value that the operator is called on.
 * @returns An appropriate SequenceType if the operation was valid, undefined if not.
 */
export function annotateUnaryMinus(
	ast: IAST,
	valueType: SequenceType | undefined
): SequenceType | undefined {
	// If we don't now the child type, we can't infer the current type
	if (!valueType) {
		const type = {
			type: ValueType.XSNUMERIC,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};

		// Attach the type to the AST
		astHelper.insertAttribute(ast, 'type', type);
		return type;
	}

	// Make sure we are actually working with numbers here
	if (isSubtypeOf(valueType.type, ValueType.XSNUMERIC)) {
		const type = {
			type: valueType.type,
			mult: valueType.mult,
		};

		// Attach the type to the AST
		astHelper.insertAttribute(ast, 'type', type);
		return type;
	}

	return undefined;
}

/**
 * Adds the unary plus operator type annotation to the AST.
 * The unary plus returns the value of its operand with the sign unchanged (+2 = 2 and +-2 = -2).
 *
 * @param ast A reference to the AST, so a new node can be inserted.
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

		astHelper.insertAttribute(ast, 'type', type);
		return type;
	}

	return undefined;
}
