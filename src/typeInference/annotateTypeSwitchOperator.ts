import { SequenceType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';

// TODO: Annotation not yet implemented. The docs don't mention it so we don't know the return types.
export function annotateTypeSwitchOperator(ast: IAST): SequenceType {
	return undefined;
}
