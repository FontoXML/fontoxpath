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

		this._getStringifiedValue = () => `(instance-of ${this._expression.toString()} ${this._typeTest.toString()} ${this._multiplicity})`;
	}

	evaluate (dynamicContext) {
		const evaluatedExpression = this._expression.evaluate(dynamicContext);

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

		const isInstanceOf = Array.from(evaluatedExpression.value()).every(argumentItem => {
			const contextItem = Sequence.singleton(argumentItem);
			const scopedContext = dynamicContext._createScopedContext({
				contextItemIndex: 0,
				contextItem: argumentItem,
				contextSequence: contextItem
			});
			return this._typeTest.evaluate(scopedContext).getEffectiveBooleanValue();
		});

		return Sequence.singleton(isInstanceOf ? BooleanValue.TRUE : BooleanValue.FALSE);
	}
}

export default InstanceOfOperator;
