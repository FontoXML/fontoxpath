import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * A context item expression evaluates to the context item. Hence the type that is returned is the one from the current context.
 *
 * @param ast the AST to be annotated.
 * @returns the type of the context item.
 */
export function annotateContextItemExpr(ast: IAST): SequenceType {
	// TODO: What type should be returned here?
	return {
		type: ValueType.ITEM,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};
}
