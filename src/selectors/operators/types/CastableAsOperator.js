import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import canCastToType from '../../dataTypes/canCastToType';

/**
 * @extends {Selector}
 */
class CastableAsOperator extends Selector {
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
			return this._allowsEmptySequence ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
		}
		if (evaluatedExpression.isSingleton()) {
			return canCastToType(evaluatedExpression.first(), this._targetType) ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
		}
		return Sequence.singletonFalseSequence();;
	}
}

export default CastableAsOperator;
