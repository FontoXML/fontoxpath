import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './annotateAST';

/**
 * At this moment there is no way to infer the return type of this function as
 * this would require the query to be executed. Therefore, the it would return item()*.
 *
 * @param ast The ast we need to check the type of.
 * @param staticContext The context in which it is evaluated.
 * @param functionItem the function body itself.
 * @param args the arguments with which the function is called.
 * @returns The type of the ast.
 */
export function annotateDynamicFunctionInvocationExpr(
	ast: IAST,
	context: AnnotationContext,
	functionItem: SequenceType,
	args: SequenceType
): SequenceType {
	const itemReturn = {
		type: ValueType.ITEM,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};
	astHelper.insertAttribute(ast, 'type', itemReturn);
	return itemReturn;
}
