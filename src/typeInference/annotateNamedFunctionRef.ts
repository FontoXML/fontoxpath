import { SequenceType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Annotate named function references by extracting the function info from the static context
 * and inserting the return type to the AST as new attribute `type`.
 *
 * @param ast the AST to be annotated.
 * @param staticContext from witch the function info is extracted.
 * @returns the inferred type or `undefined` when the named function reference type cannot be inferred.
 */
export function annotateNamedFunctionRef(
	ast: IAST,
	staticContext: StaticContext
): SequenceType | undefined {
	return undefined;
}
