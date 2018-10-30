import Sequence from '../../dataTypes/Sequence';
import Expression from '../../Expression';
import castToType from '../../dataTypes/castToType';

/**
 * @extends {Expression}
 */
class castAsOperator extends Expression {
	/**
	 * @param  {!Expression}  expression
	 * @param  {{prefix:string, namespaceURI:?string, localName:string}}    targetType
	 * @param  {!boolean}   allowsEmptySequence
	 */
	constructor (expression, targetType, allowsEmptySequence) {
		super(expression.specificity, [expression], { canBeStaticallyEvaluated: false });
		this._targetType = targetType.prefix ? `${targetType.prefix}:${targetType.localName}` : targetType.localName;
		if (this._targetType === 'xs:anyAtomicType' || this._targetType === 'xs:anySimpleType' || this._targetType === 'xs:NOTATION') {
			throw new Error('XPST0080: Casting to xs:anyAtomicType, xs:anySimpleType or xs:NOTATION is not permitted.');
		}

		if (targetType.namespaceURI) {
			throw new Error('Not implemented: casting expressions with a namespace URI.');
		}

		this._expression = expression;
		this._allowsEmptySequence = allowsEmptySequence;

	}

	evaluate (dynamicContext, executionParameters) {
		/**
		 * @type {Sequence}
		 */
		const evaluatedExpression = this._expression.evaluateMaybeStatically(dynamicContext, executionParameters).atomize(executionParameters);
		return evaluatedExpression.switchCases({
			empty: () => {
				if (!this._allowsEmptySequence) {
					throw new Error('XPTY0004: Sequence to cast is empty while target type is singleton.');
				}
				return Sequence.empty();
			},
			singleton: () => {
				return evaluatedExpression.map(value => castToType(value, this._targetType));
			},
			multiple: (() => {
				throw new Error('XPTY0004: Sequence to cast is not singleton or empty.');
			})
		});
	}
}

export default castAsOperator;
