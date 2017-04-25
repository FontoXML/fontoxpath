import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import { castToType } from '../../dataTypes/conversionHelper';

/**
 * @extends {Selector}
 */
class castAsOperator extends Selector {
	/**
	 * @param  {!Selector}  expression
	 * @param  {!string}    targetType
	 * @param  {!boolean}   allowsEmptySequence
	 */
	constructor (expression, targetType, allowsEmptySequence) {
		super(expression.specificity);

		this._expression = expression;
		this._targetType = targetType;
		this._allowsEmptySequence = allowsEmptySequence;

	}

	evaluate (dynamicContext) {
		var evaluatedExpression = this._expression.evaluate(dynamicContext).atomize(dynamicContext);
		if (evaluatedExpression.value.length > 1) {
			throw new Error('XPTY0004: Sequence to cast is not singleton or empty.');
		}
		if (evaluatedExpression.isEmpty()) {
			if (!this._allowsEmptySequence) {
				throw new Error('XPTY0004: Sequence to cast is empty while target type is singleton.');
			}
			return evaluatedExpression;
		}

		return Sequence.singleton(castToType(evaluatedExpression.first(), this._targetType));
	}
}

export default castAsOperator;
