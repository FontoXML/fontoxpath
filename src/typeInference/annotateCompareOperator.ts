import { doesTypeAllowEmpty } from '../expressions/dataTypes/typeHelpers';
import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Annotates the AST for the general comparison operator:
 * equalOp, notEqualOp, lessThanOrEqualOp, lessThanOp, greaterThanOrEqualOp, greaterThanOp.
 *
 * @param ast The ast to re-insert the annotation into.
 * @returns At the moment this always returns a boolean, because regardless.
 * of the input, that's what a comparison will return.
 */
export function annotateGeneralCompare(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}

/**
 * Annotates the AST for the value comparison operator:
 * eqOp, neOp, ltOp, leOp, gtOp, geOp.
 *
 * @param ast The ast to re-insert the annotation into.
 * @returns At the moment this always returns a boolean, because regardless.
 * of the input, that's what a comparison will return.
 */
export function annotateValueCompare(ast: IAST): SequenceType {
	// A value comparison only returns an empty sequence if either of its arguments is empty
	const firstOperandType = astHelper.getAttribute(
		astHelper.followPath(ast, ['firstOperand', '*']),
		'type'
	);
	const secondOperandType = astHelper.getAttribute(
		astHelper.followPath(ast, ['secondOperand', '*']),
		'type'
	);
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult:
			doesTypeAllowEmpty(firstOperandType) || doesTypeAllowEmpty(secondOperandType)
				? SequenceMultiplicity.ZERO_OR_ONE
				: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}

/**
 * Annotates the AST for the node comparison operator:
 * nodeBeforeOp, nodeAfterOp.
 *
 * @param ast The ast to re-insert the annotation into.
 * @returns At the moment this always returns a boolean, because regardless.
 * of the input, that's what a comparison will return.
 */
export function annotateNodeCompare(ast: IAST): SequenceType {
	// A node comparison only returns an empty sequence if either of its arguments is empty
	const firstOperandType = astHelper.getAttribute(
		astHelper.followPath(ast, ['firstOperand', '*']),
		'type'
	);
	const secondOperandType = astHelper.getAttribute(
		astHelper.followPath(ast, ['secondOperand', '*']),
		'type'
	);
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult:
			doesTypeAllowEmpty(firstOperandType) || doesTypeAllowEmpty(secondOperandType)
				? SequenceMultiplicity.ZERO_OR_ONE
				: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
