import Expression, { RESULT_ORDERINGS } from '../Expression';
import PossiblyUpdatingExpression from '../PossiblyUpdatingExpression';

import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import { IAsyncIterator, IterationHint, notReady } from '../util/iterators';

class IfExpression extends PossiblyUpdatingExpression {
	constructor(
		testExpression: Expression,
		thenExpression: PossiblyUpdatingExpression,
		elseExpression: PossiblyUpdatingExpression
	) {
		const specificity = testExpression.specificity
			.add(thenExpression.specificity)
			.add(elseExpression.specificity);
		super(specificity, [testExpression, thenExpression, elseExpression], {
			resultOrder:
				thenExpression.expectedResultOrder === elseExpression.expectedResultOrder
					? thenExpression.expectedResultOrder
					: RESULT_ORDERINGS.UNSORTED,
			peer: thenExpression.peer === elseExpression.peer && thenExpression.peer,
			subtree: thenExpression.subtree === elseExpression.subtree && thenExpression.subtree,
			canBeStaticallyEvaluated:
				testExpression.canBeStaticallyEvaluated &&
				thenExpression.canBeStaticallyEvaluated &&
				elseExpression.canBeStaticallyEvaluated
		});
	}

	public performFunctionalEvaluation(
		dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters,
		sequenceCallbacks: ((dynamicContext: DynamicContext) => ISequence)[]
	) {
		let resultIterator: IAsyncIterator<Value> | null = null;
		const ifExpressionResultSequence = sequenceCallbacks[0](dynamicContext);

		return sequenceFactory.create({
			next: (hint: IterationHint) => {
				if (!resultIterator) {
					const ifExpressionResult = ifExpressionResultSequence.tryGetEffectiveBooleanValue();

					if (!ifExpressionResult.ready) {
						return notReady(ifExpressionResult.promise);
					}
					const resultSequence = ifExpressionResult.value
						? sequenceCallbacks[1](dynamicContext)
						: sequenceCallbacks[2](dynamicContext);
					resultIterator = resultSequence.value;
				}
				return resultIterator.next(hint);
			}
		});
	}
}

export default IfExpression;
