import { SequenceType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';

/**
 * A context item expression evaluates to the context item. Hence the type that is returned is the one from the context item.
 * @param ast the AST to be annotated.
 * @returns the type of the context item.
 */
export function annotateContextItemExpr(ast: IAST): SequenceType | undefined {
	// TODO: What type should be returned here?
	return undefined;
}
