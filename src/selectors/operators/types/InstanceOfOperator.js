import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import sequenceEvery from '../../util/sequenceEvery';
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
		super(expression.specificity, { canBeStaticallyEvaluated: false });

		this._expression = expression;
		this._typeTest = typeTest;
		this._multiplicity = multiplicity;
	}

	evaluate (dynamicContext) {
		const evaluatedExpression = this._expression.evaluateMaybeStatically(dynamicContext);
		return evaluatedExpression.switchCases({
			empty: () => {
				if (this._multiplicity === '?' || this._multiplicity === '*') {
					return Sequence.singletonTrueSequence();
				}
				// Disallowed
				return Sequence.singletonFalseSequence();
			},
			multiple: () => {
				if (this._multiplicity === '?') {
					return Sequence.singletonFalseSequence();
				}
				return sequenceEvery(evaluatedExpression, value => {
					const contextItem = Sequence.singleton(value);
					const scopedContext = dynamicContext.scopeWithFocus(0, value, contextItem);
					return this._typeTest.evaluateMaybeStatically(scopedContext);
				});
			},
			singleton: () => {
				return sequenceEvery(evaluatedExpression, value => {
					const contextItem = Sequence.singleton(value);
					const scopedContext = dynamicContext.scopeWithFocus(0, value, contextItem);
					return this._typeTest.evaluateMaybeStatically(scopedContext);
				});
			}
		});
	}
}

export default InstanceOfOperator;
