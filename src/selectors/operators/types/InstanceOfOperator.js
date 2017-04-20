import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import createAtomicValue from '../../dataTypes/createAtomicValue';

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
		super(expression.specificity);

		this._expression = expression;
		this._typeTest = typeTest;
		this._multiplicity = multiplicity;
	}

	evaluate (dynamicContext) {
		const evaluatedExpression = this._expression.evaluate(dynamicContext);

		switch (this._multiplicity) {
			case '?':
				if (!evaluatedExpression.isEmpty() && !evaluatedExpression.isSingleton()) {
					return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
				}
				break;

			case '+':
				if (evaluatedExpression.isEmpty()) {
					return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
				}
				break;

			case '*':
				break;

			default:
				if (!evaluatedExpression.isSingleton()) {
					return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
				}
		}

		const isInstanceOf = evaluatedExpression.getAllValues().every(argumentItem => {
		// const isInstanceOf = Array.from(evaluatedExpression.value()).every(argumentItem => {
			const contextItem = Sequence.singleton(argumentItem);
			const scopedContext = dynamicContext.createScopedContext({
				contextItemIndex: 0,
				contextItem: argumentItem,
				contextSequence: contextItem
			});
			return this._typeTest.evaluate(scopedContext).getEffectiveBooleanValue();
		});

		return Sequence.singleton(createAtomicValue(isInstanceOf, 'xs:boolean'));
	}
}

export default InstanceOfOperator;
