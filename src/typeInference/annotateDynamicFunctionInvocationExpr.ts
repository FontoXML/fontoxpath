import { SequenceType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';
import { IAST } from '../parsing/astHelper';

/**
 * At this moment there is no way to infre the return type of this function as
 * this would require the query to be executed. Therefore, the it would return undefined.
 *
 * @param ast The ast we need to check the type of.
 * @param staticContext The context in which it is evaluated.
 * @param functionItem the function body itself.
 * @param args the arguments with which the function is called.
 * @returns The type of the ast.
 */
export function annotateDynamicFunctionInvocationExpr(
	ast: IAST,
	staticContext: StaticContext,
	functionItem: SequenceType,
	args: SequenceType
): SequenceType {
	return undefined;
}
