import SequenceFactory from '../../dataTypes/SequenceFactory';
import Expression from '../../Expression';
import canCastToType from '../../dataTypes/canCastToType';
import { trueBoolean, falseBoolean } from '../../dataTypes/createAtomicValue';

/**
 * @extends {Expression}
 */
class CastableAsOperator extends Expression {
	_targetType: string;
	_expression: Expression;
	_allowsEmptySequence: boolean;

	/**
	 * @param  {!Expression}  expression
	 * @param  {{prefix:string, namespaceURI:?string, localName:string}}    targetType
	 * @param  {!boolean}   allowsEmptySequence
	 */
	constructor (expression: Expression, targetType: { prefix: string; namespaceURI: string | null; localName: string; }, allowsEmptySequence: boolean) {
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
		const evaluatedExpression = this._expression.evaluateMaybeStatically(dynamicContext, executionParameters).atomize(executionParameters);
		return evaluatedExpression.switchCases({
			empty: () => {
				if (!this._allowsEmptySequence) {
					return SequenceFactory.singletonFalseSequence();
				}
				return SequenceFactory.singletonTrueSequence();
			},
			singleton: () => {
				return evaluatedExpression.map(value => canCastToType(value, this._targetType) ? trueBoolean : falseBoolean);
			},
			multiple: () => {
				return SequenceFactory.singletonFalseSequence();
			}
		});
	}
}

export default CastableAsOperator;
