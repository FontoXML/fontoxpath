import Selector from '../Selector';
/**
 * @extends {Selector}
 */
class IfExpression extends Selector {
	/**
	 * @param  {Selector}  testExpression
	 * @param  {Selector}  thenExpression
	 * @param  {Selector}  elseExpression
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
				subtree: thenExpression.subtree === elseExpression.subtree && thenExpression.subtree
			});

		this._testExpression = testExpression;
		this._thenExpression = thenExpression;
		this._elseExpression = elseExpression;


	}

	evaluate (dynamicContext) {
		if (this._testExpression.evaluate(dynamicContext).getEffectiveBooleanValue()) {
			return this._thenExpression.evaluate(dynamicContext);
		}
		return this._elseExpression.evaluate(dynamicContext);
	}
}

export default IfExpression;
