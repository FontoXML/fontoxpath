import Sequence from '../../dataTypes/Sequence';
import Expression from '../../Expression';
import sequenceEvery from '../../util/sequenceEvery';

class InstanceOfOperator extends Expression {
	/**
	 * @param  {!Expression}  expression
	 * @param  {!Expression}  typeTest
	 * @param  {!string}    multiplicity
	 */
	constructor (expression, typeTest, multiplicity) {
		super(expression.specificity, [expression], { canBeStaticallyEvaluated: false });

		this._expression = expression;
		this._typeTest = typeTest;
		this._multiplicity = multiplicity;
	}

	evaluate (dynamicContext, executionParameters) {
		/**
		 * @type {!Sequence}
		 */
		const evaluatedExpression = this._expression.evaluateMaybeStatically(dynamicContext, executionParameters);
		return evaluatedExpression.switchCases({
			empty: () => {
				if (this._multiplicity === '?' || this._multiplicity === '*') {
					return Sequence.singletonTrueSequence();
				}
				// Disallowed
				return Sequence.singletonFalseSequence();
			},
			multiple: () => {
				if (this._multiplicity === '+' || this._multiplicity === '*') {
					return sequenceEvery(evaluatedExpression, value => {
						const contextItem = Sequence.singleton(value);
						const scopedContext = dynamicContext.scopeWithFocus(0, value, contextItem);
						return this._typeTest.evaluateMaybeStatically(scopedContext, executionParameters);
					});
				}
				return Sequence.singletonFalseSequence();
			},
			singleton: () => {
				return sequenceEvery(evaluatedExpression, value => {
					const contextItem = Sequence.singleton(value);
					const scopedContext = dynamicContext.scopeWithFocus(0, value, contextItem);
					return this._typeTest.evaluateMaybeStatically(scopedContext, executionParameters);
				});
			}
		});
	}
}

export default InstanceOfOperator;
