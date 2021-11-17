import { EvaluableExpression } from '..';
import sequenceFactory from '../expressions/dataTypes/sequenceFactory';
import ExecutionParameters from '../expressions/ExecutionParameters';
import UpdatingExpressionResult from '../expressions/UpdatingExpressionResult';
import convertXDMReturnValue, { IReturnTypes } from '../parsing/convertXDMReturnValue';
import { Node } from '../types/Types';

export default function convertUpdateResultToTransferable<
	TNode extends Node,
	TReturnType extends keyof IReturnTypes<TNode>
>(
	result: UpdatingExpressionResult,
	script: EvaluableExpression | string,
	returnType: TReturnType,
	executionParameters: ExecutionParameters
): { pendingUpdateList: object[]; xdmValue: IReturnTypes<TNode>[TReturnType] } {
	return {
		['pendingUpdateList']: result.pendingUpdateList.map((update) =>
			update.toTransferable(executionParameters)
		),
		['xdmValue']: convertXDMReturnValue(
			script,
			sequenceFactory.create(result.xdmValue),
			returnType,
			executionParameters
		),
	};
}
