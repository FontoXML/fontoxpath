import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { OptimizationOptions } from '../Expression';
import Specificity from '../Specificity';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { IAsyncIterator, notReady, ready } from '../util/iterators';

abstract class UpdatingExpression extends Expression {
	constructor(
		specificity: Specificity,
		childExpressions: Expression[],
		optimizationOptions: OptimizationOptions
	) {
		super(specificity, childExpressions, optimizationOptions);

		this.isUpdating = true;
	}

	public ensureUpdateListWrapper(
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

	public evaluate(): never {
		throw new Error(
			'Can not execute an updating expression without catching the pending updates'
		);
	}

	public abstract evaluateWithUpdateList(
		_dynamicContext: DynamicContext | null,
		_executionParameters: ExecutionParameters
	): IAsyncIterator<UpdatingExpressionResult>;
}

export default UpdatingExpression;
