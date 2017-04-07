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
			thenExpression.expectedResultOrder === elseExpression.expectedResultOrder ?
				thenExpression.expectedResultOrder : Selector.RESULT_ORDERINGS.UNSORTED);

		this._testExpression = testExpression;
		this._thenExpression = thenExpression;
		this._elseExpression = elseExpression;
	}

	toString () {
		if (!this._stringifiedValue) {
			this._stringifiedValue = `(if ${this._testExpression.toString()} ${this._thenExpression} ${this._elseExpression})`;
		}

		return this._stringifiedValue;
	}

	evaluate (dynamicContext) {
		if (this._testExpression.evaluate(dynamicContext).getEffectiveBooleanValue()) {
			return this._thenExpression.evaluate(dynamicContext);
		}
		return this._elseExpression.evaluate(dynamicContext);
	}
}

export default IfExpression;
