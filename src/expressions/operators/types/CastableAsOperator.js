import Sequence from '../../dataTypes/Sequence';
import Expression from '../../Expression';
import canCastToType from '../../dataTypes/canCastToType';
import { trueBoolean, falseBoolean } from '../../dataTypes/createAtomicValue';

/**
 * @extends {Expression}
 */
class CastableAsOperator extends Expression {
	/**
	 * @param  {!Expression}  expression
	 * @param  {{prefix:string, namespaceURI:string, localName}}    targetType
	 * @param  {!boolean}   allowsEmptySequence
	 */
	constructor (expression, targetType, allowsEmptySequence) {
		super(expression.specificity, [expression], { canBeStaticallyEvaluated: false });

		this._targetType = targetType.prefix ? `${targetType.prefix}:${targetType.localName}` : targetType.localName;
		if (this._targetType === 'xs:anyAtomicType' || this._targetType === 'xs:anySimpleType' || this._targetType === 'xs:NOTATION') {
			throw new Error('XPST0080: Casting to xs:anyAtomicType, xs:anySimpleType or xs:NOTATION is not permitted.');
		}


		if (targetType.namespaceURI) {
			throw new Error('Not implemented: castable as expressions with a namespace URI.');
		}

		this._expression = expression;
		this._allowsEmptySequence = allowsEmptySequence;
	}

	evaluate (dynamicContext, executionParameters) {
		/**
		 * @type {!Sequence}
		 */
		const evaluatedExpression = this._expression.evaluateMaybeStatically(dynamicContext, executionParameters).atomize(executionParameters);
		return evaluatedExpression.switchCases({
			empty: () => {
				if (!this._allowsEmptySequence) {
					return Sequence.singletonFalseSequence();
				}
				return Sequence.singletonTrueSequence();
			},
			singleton: () => {
				return evaluatedExpression.map(value => canCastToType(value, this._targetType) ? trueBoolean : falseBoolean);
			},
			multiple: () => {
				return Sequence.singletonFalseSequence();
			}
		});
	}
}

export default CastableAsOperator;
