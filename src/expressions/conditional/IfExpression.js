import Expression from '../Expression';
import Sequence from '../dataTypes/Sequence';
import { notReady } from '../util/iterators';

/**
 * @extends {Expression}
 */
class IfExpression extends Expression {
	/**
	 * @param  {!Expression}  testExpression
	 * @param  {!Expression}  thenExpression
	 * @param  {!Expression}  elseExpression
	 */
	constructor (testExpression, thenExpression, elseExpression) {
		var specificity = testExpression.specificity
			.add(thenExpression.specificity)
			.add(elseExpression.specificity);
		super(
			specificity,
			[testExpression, thenExpression, elseExpression],
			{
				resultOrder: thenExpression.expectedResultOrder === elseExpression.expectedResultOrder ?
					thenExpression.expectedResultOrder : Expression.RESULT_ORDERINGS.UNSORTED,
				peer: thenExpression.peer === elseExpression.peer && thenExpression.peer,
				subtree: thenExpression.subtree === elseExpression.subtree && thenExpression.subtree,
				canBeStaticallyEvaluated: testExpression.canBeStaticallyEvaluated && thenExpression.canBeStaticallyEvaluated && elseExpression.canBeStaticallyEvaluated
			});

		this._testExpression = testExpression;
		this._thenExpression = thenExpression;
		this._elseExpression = elseExpression;
	}

	evaluate (dynamicContext, executionParameters) {
		let resultIterator = null;
		const ifExpressionResultSequence = this._testExpression.evaluateMaybeStatically(dynamicContext, executionParameters);
		return new Sequence({
			next: () => {
				if (!resultIterator) {
					const ifExpressionResult = ifExpressionResultSequence.tryGetEffectiveBooleanValue();

					if (!ifExpressionResult.ready) {
						return notReady(ifExpressionResult.promise);
					}
					const resultSequence = ifExpressionResult.value ?
						this._thenExpression.evaluateMaybeStatically(dynamicContext, executionParameters) :
						this._elseExpression.evaluateMaybeStatically(dynamicContext, executionParameters);
					resultIterator = resultSequence.value();
				}
				return resultIterator.next();
			}
		});
	}
}

export default IfExpression;
