import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './annotateAST';

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
	valueType: SequenceType | undefined,
	context: AnnotationContext
): SequenceType | undefined {
	// If we don't now the child type, we can't infer the current type
	if (!valueType) {
		return undefined;
	}

	// Make sure we are actually working with numbers here
	if (isSubtypeOf(valueType.type, ValueType.XSNUMERIC)) {
		const type = {
			type: valueType.type,
			mult: valueType.mult,
		};

		// Attach the type to the AST
		context.totalAnnotated[context.totalAnnotated.length - 1]++;
		astHelper.insertAttribute(ast, 'type', type);
		return type;
	}

	const doubleType = {
		type: ValueType.XSDOUBLE,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};
	astHelper.insertAttribute(ast, 'type', doubleType);
	return doubleType;
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
	valueType: SequenceType | undefined,
	context: AnnotationContext
): SequenceType | undefined {
	if (!valueType) {
		return undefined;
	}

	if (isSubtypeOf(valueType.type, ValueType.XSNUMERIC)) {
		const type = {
			type: valueType.type,
			mult: valueType.mult,
		};

		context.totalAnnotated[context.totalAnnotated.length - 1]++;
		astHelper.insertAttribute(ast, 'type', type);
		return type;
	}

	const doubleType = {
		type: ValueType.XSDOUBLE,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};
	astHelper.insertAttribute(ast, 'type', doubleType);
	return doubleType;
}
