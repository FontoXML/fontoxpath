import ISequence from '../dataTypes/ISequence';
import { SequenceType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { OptimizationOptions } from '../Expression';
import Specificity from '../Specificity';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { IIterator, ready } from '../util/iterators';
import { errXUST0001 } from './XQueryUpdateFacilityErrors';

abstract class UpdatingExpression extends Expression {
	constructor(
		specificity: Specificity,
		childExpressions: Expression[],
		optimizationOptions: OptimizationOptions,
		type?: SequenceType
	) {
		super(specificity, childExpressions, optimizationOptions, true, type);

		this.isUpdating = true;
	}

	public evaluate(
		_dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters
	): ISequence {
		throw errXUST0001();
	}

	protected ensureUpdateListWrapper(
		expression: Expression
	): (
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	) => IIterator<UpdatingExpressionResult> {
		if (expression.isUpdating) {
			const updatingExpression = expression as UpdatingExpression;
			return (dynamicContext: DynamicContext, executionParameters: ExecutionParameters) =>
				updatingExpression.evaluateWithUpdateList(dynamicContext, executionParameters);
		}

		return (dynamicContext: DynamicContext, executionParameters: ExecutionParameters) => {
			const sequence = expression.evaluate(dynamicContext, executionParameters);
			return {
				next: () => {
					const allValues = sequence.getAllValues();
					return ready({
						pendingUpdateList: [],
						xdmValue: allValues,
					});
				},
			};
		};
	}

	public abstract evaluateWithUpdateList(
		_dynamicContext: DynamicContext | null,
		_executionParameters: ExecutionParameters
	): IIterator<UpdatingExpressionResult>;
}

export default UpdatingExpression;
