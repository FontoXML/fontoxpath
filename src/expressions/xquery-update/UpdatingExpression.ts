import Expression from '../Expression';

import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import { ready } from '../util/iterators';

abstract class UpdatingExpression extends Expression {
	constructor(specificity, childExpressions, optimizationOptions) {
		super(specificity, childExpressions, optimizationOptions);

		this.isUpdating = true;
	}

	public ensureUpdateListWrapper(expression) {
		if (expression.isUpdating) {
			return (dynamicContext, executionParameters) =>
				expression.evaluateWithUpdateList(dynamicContext, executionParameters);
		}

		return (dynamicContext, executionParameters) => {
			const sequence = expression.evaluate(dynamicContext, executionParameters);
			return {
				next: () => {
					const allValues = sequence.tryGetAllValues();
					if (!allValues.ready) {
						return allValues;
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
	): { next: () => any };
}

export default UpdatingExpression;
