import sequenceFactory from '../../dataTypes/sequenceFactory';
import Expression from '../../Expression';
import sequenceEvery from '../../util/sequenceEvery';

class InstanceOfOperator extends Expression {
	private _expression: Expression;
	private _multiplicity: string;
	private _typeTest: Expression;

	constructor(expression: Expression, typeTest: Expression, multiplicity: string) {
		super(expression.specificity, [expression], { canBeStaticallyEvaluated: false });

		this._expression = expression;
		this._typeTest = typeTest;
		this._multiplicity = multiplicity;
	}

	public evaluate(dynamicContext, executionParameters) {
		const evaluatedExpression = this._expression.evaluateMaybeStatically(
			dynamicContext,
			executionParameters
		);
		return evaluatedExpression.switchCases({
			empty: () => {
				if (this._multiplicity === '?' || this._multiplicity === '*') {
					return sequenceFactory.singletonTrueSequence();
				}
				// Disallowed
				return sequenceFactory.singletonFalseSequence();
			},
			multiple: () => {
				if (this._multiplicity === '+' || this._multiplicity === '*') {
					return sequenceEvery(evaluatedExpression, value => {
						const contextItem = sequenceFactory.singleton(value);
						const scopedContext = dynamicContext.scopeWithFocus(0, value, contextItem);
						return this._typeTest.evaluateMaybeStatically(
							scopedContext,
							executionParameters
						);
					});
				}
				return sequenceFactory.singletonFalseSequence();
			},
			singleton: () => {
				return sequenceEvery(evaluatedExpression, value => {
					const contextItem = sequenceFactory.singleton(value);
					const scopedContext = dynamicContext.scopeWithFocus(0, value, contextItem);
					return this._typeTest.evaluateMaybeStatically(
						scopedContext,
						executionParameters
					);
				});
			}
		});
	}
}

export default InstanceOfOperator;
