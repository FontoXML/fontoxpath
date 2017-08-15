import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import { notReady } from '../util/iterators';

/**
 * @extends {Selector}
 */
class IfExpression extends Selector {
	/**
	 * @param  {!Selector}  testExpression
	 * @param  {!Selector}  thenExpression
	 * @param  {!Selector}  elseExpression
	 */
	constructor (testExpression, thenExpression, elseExpression) {
		var specificity = testExpression.specificity
			.add(thenExpression.specificity)
			.add(elseExpression.specificity);
		super(
			specificity,
			{
				resultOrder: thenExpression.expectedResultOrder === elseExpression.expectedResultOrder ?
					thenExpression.expectedResultOrder : Selector.RESULT_ORDERINGS.UNSORTED,
				peer: thenExpression.peer === elseExpression.peer && thenExpression.peer,
				subtree: thenExpression.subtree === elseExpression.subtree && thenExpression.subtree,
				canBeStaticallyEvaluated: testExpression.canBeStaticallyEvaluated && thenExpression.canBeStaticallyEvaluated && elseExpression.canBeStaticallyEvaluated
			});

		this._testExpression = testExpression;
		this._thenExpression = thenExpression;
		this._elseExpression = elseExpression;
	}

	evaluate (dynamicContext) {
		let resultIterator = null;
		/**
		 * @type {../dataTypes/Sequence}
		 */
		const ifExpressionResultSequence = this._testExpression.evaluateMaybeStatically(dynamicContext);
		return new Sequence({
			next: () => {
				if (!resultIterator) {
					const ifExpressionResult = ifExpressionResultSequence.tryGetEffectiveBooleanValue();

					if (!ifExpressionResult.ready) {
						return notReady(ifExpressionResult.promise);
					}
					const resultSequence = ifExpressionResult.value ?
						this._thenExpression.evaluateMaybeStatically(dynamicContext) :
						this._elseExpression.evaluateMaybeStatically(dynamicContext);
					resultIterator = resultSequence.value();
				}
				return resultIterator.next();
			}
		});
	}
}

export default IfExpression;
