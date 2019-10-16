import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { OptimizationOptions } from '../Expression';
import Specificity from '../Specificity';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { IAsyncIterator, notReady, ready } from '../util/iterators';
import { errXUST0001 } from './XQueryUpdateFacilityErrors';
import ISequence from '../dataTypes/ISequence';

export function ensureUpdateListWrapper(
	expression: Expression
): (
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters
) => IAsyncIterator<UpdatingExpressionResult> {
	if (expression.isUpdating) {
		const updatingExpression = expression as UpdatingExpression;
		return (dynamicContext: DynamicContext, executionParameters: ExecutionParameters) =>
			updatingExpression.evaluateWithUpdateList(dynamicContext, executionParameters);
	}

	return (dynamicContext: DynamicContext, executionParameters: ExecutionParameters) => {
		const sequence = expression.evaluate(dynamicContext, executionParameters);
		return {
			next: () => {
				const allValues = sequence.tryGetAllValues();
				if (!allValues.ready) {
					return notReady(allValues.promise);
				}
				return ready({
					pendingUpdateList: [],
					xdmValue: allValues.value
				});
			}
		};
	};
}

abstract class UpdatingExpression extends Expression {
	constructor(
		specificity: Specificity,
		childExpressions: Expression[],
		optimizationOptions: OptimizationOptions
	) {
		super(specificity, childExpressions, optimizationOptions);

		this.isUpdating = true;
	}

	public evaluate(
		_dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters
	): ISequence {
		throw errXUST0001();
	}

	public abstract evaluateWithUpdateList(
		_dynamicContext: DynamicContext | null,
		_executionParameters: ExecutionParameters
	): IAsyncIterator<UpdatingExpressionResult>;
}

export default UpdatingExpression;
