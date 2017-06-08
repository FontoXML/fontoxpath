import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import castToType from '../../dataTypes/castToType';

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
		super(expression.specificity, { canBeStaticallyEvaluated: false });

		if (targetType === 'xs:anyAtomicType' || targetType === 'xs:anySimpleType' || targetType === 'xs:NOTATION') {
			throw new Error('XPST0080: Casting to xs:anyAtomicType, xs:anySimpleType or xs:NOTATION is not permitted.');
		}

		this._expression = expression;
		this._targetType = targetType;
		this._allowsEmptySequence = allowsEmptySequence;

	}

	evaluate (dynamicContext) {
		var evaluatedExpression = this._expression.evaluateMaybeStatically(dynamicContext).atomize(dynamicContext);

		if (evaluatedExpression.isEmpty()) {
			if (!this._allowsEmptySequence) {
				throw new Error('XPTY0004: Sequence to cast is empty while target type is singleton.');
			}
			return evaluatedExpression;
		}
		if (evaluatedExpression.isSingleton()) {
			return Sequence.singleton(castToType(evaluatedExpression.first(), this._targetType));
		}
		throw new Error('XPTY0004: Sequence to cast is not singleton or empty.');
	}
}

export default castAsOperator;
