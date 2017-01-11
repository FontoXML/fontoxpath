import Sequence from '../../dataTypes/Sequence';
import BooleanValue from '../../dataTypes/BooleanValue';
import Selector from '../../Selector';

/**
 * @extends {Selector}
 */
class InstanceOfOperator extends Selector {
	/**
	 * @param  {!Selector}  expression
	 * @param  {!Selector}  typeTest
	 * @param  {!string}    multiplicity
	 */
	constructor (expression, typeTest, multiplicity) {
		super(
			expression.specificity,
			Selector.RESULT_ORDERINGS.UNSORTED
		);

		this._expression = expression;
		this._typeTest = typeTest;
		this._multiplicity = multiplicity;
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof InstanceOfOperator &&
			this._multiplicity === otherSelector._multiplicity &&
			this._expression.equals(otherSelector._expression) &&
			this._typeTest.equals(otherSelector._typeTest);
	}

	evaluate (dynamicContext) {
		var evaluatedExpression = this._expression.evaluate(dynamicContext);

		switch (this._multiplicity) {
			case '?':
				if (!evaluatedExpression.isEmpty() && !evaluatedExpression.isSingleton()) {
					return Sequence.singleton(BooleanValue.FALSE);
				}
				break;

			case '+':
				if (evaluatedExpression.isEmpty()) {
					return Sequence.singleton(BooleanValue.FALSE);
				}
				break;

			case '*':
				break;

			default:
				if (!evaluatedExpression.isSingleton()) {
					return Sequence.singleton(BooleanValue.FALSE);
				}
		}

		var isInstanceOf = evaluatedExpression.value.every(function (argumentItem) {
				var scopedContext = dynamicContext.createScopedContext({
						contextItem: Sequence.singleton(argumentItem)
					});
				return this._typeTest.evaluate(scopedContext).getEffectiveBooleanValue();
			}.bind(this));

		return Sequence.singleton(isInstanceOf ? BooleanValue.TRUE : BooleanValue.FALSE);
	}
}

export default InstanceOfOperator;
