import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import canCastToType from '../../dataTypes/canCastToType';
import createAtomicValue from '../../dataTypes/createAtomicValue';

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
		super(expression.specificity);

		if (targetType === 'xs:anyAtomicType' || targetType === 'xs:anySimpleType' || targetType === 'xs:NOTATION') {
			throw new Error('XPST0080: Casting to xs:anyAtomicType, xs:anySimpleType or xs:NOTATION is not permitted.');
		}

		this._expression = expression;
		this._targetType = targetType;
		this._allowsEmptySequence = allowsEmptySequence;
	}

	evaluate (dynamicContext) {
		var evaluatedExpression = this._expression.evaluate(dynamicContext).atomize(dynamicContext);

		if (evaluatedExpression.isEmpty()) {
			return Sequence.singleton(createAtomicValue(this._allowsEmptySequence, 'xs:boolean'));
		}
		if (evaluatedExpression.isSingleton()) {
			return Sequence.singleton(createAtomicValue(canCastToType(evaluatedExpression.first(), this._targetType), 'xs:boolean'));
		}
		return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
	}
}

export default CastableAsOperator;
