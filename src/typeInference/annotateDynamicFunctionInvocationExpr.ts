import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * At this moment there is no way to infer the return type of this function as
 * this would require the query to be executed. Therefore, it would return item()*.
 *
 * @param ast The ast we need to check the type of.
 * @returns A SequenceType of item()*.
 */
export function annotateDynamicFunctionInvocationExpr(ast: IAST): SequenceType {
	const itemReturn = {
		type: ValueType.ITEM,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};
	astHelper.insertAttribute(ast, 'type', itemReturn);
	return itemReturn;
}
