import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Annotates the AST for the general comparison operator.
 *
 * @param ast The ast to re-insert the annotation into
 * @returns At the moment this always returns a boolean, because regardless
 * of the input, that's what a comparison will return
 */
export function annotateGeneralCompare(ast: IAST): SequenceType | undefined {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}

/**
 * Annotates the AST for the value comparison operator.
 *
 * @param ast The ast to re-insert the annotation into
 * @returns At the moment this always returns a boolean, because regardless
 * of the input, that's what a comparison will return
 */
export function annotateValueCompare(ast: IAST): SequenceType | undefined {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}

/**
 * Annotates the AST for the node comparison operator.
 *
 * @param ast The ast to re-insert the annotation into
 * @returns At the moment this always returns a boolean, because regardless
 * of the input, that's what a comparison will return
 */
export function annotateNodeCompare(ast: IAST): SequenceType | undefined {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
