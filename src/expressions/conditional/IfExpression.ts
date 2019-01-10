import PossiblyUpdatingExpression from '../PossiblyUpdatingExpression';
import Expression, { RESULT_ORDERINGS } from '../Expression';

import SequenceFactory from '../dataTypes/SequenceFactory';

class IfExpression extends PossiblyUpdatingExpression {
	constructor(testExpression: Expression, thenExpression: PossiblyUpdatingExpression, elseExpression: PossiblyUpdatingExpression) {
		const specificity = testExpression.specificity
			.add(thenExpression.specificity)
			.add(elseExpression.specificity);
		super(
			specificity,
			[testExpression, thenExpression, elseExpression],
			{
				resultOrder: thenExpression.expectedResultOrder === elseExpression.expectedResultOrder ?
					thenExpression.expectedResultOrder : RESULT_ORDERINGS.UNSORTED,
				peer: thenExpression.peer === elseExpression.peer && thenExpression.peer,
				subtree: thenExpression.subtree === elseExpression.subtree && thenExpression.subtree,
				canBeStaticallyEvaluated: testExpression.canBeStaticallyEvaluated && thenExpression.canBeStaticallyEvaluated && elseExpression.canBeStaticallyEvaluated
			});
	}

	performFunctionalEvaluation (dynamicContext, _executionParameters, sequenceCallbacks) {
		let resultIterator = null;
		const ifExpressionResultSequence = sequenceCallbacks[0](dynamicContext);
		return SequenceFactory.create({
			next: () => {
				if (!resultIterator) {
					const ifExpressionResult = ifExpressionResultSequence.tryGetEffectiveBooleanValue();

					if (!ifExpressionResult.ready) {
						return ifExpressionResult;
					}
					const resultSequence = ifExpressionResult.value ?
						sequenceCallbacks[1](dynamicContext) :
						sequenceCallbacks[2](dynamicContext);
					resultIterator = resultSequence.value;
				}
				return resultIterator.next();
			}
		});

	}
}

export default IfExpression;
