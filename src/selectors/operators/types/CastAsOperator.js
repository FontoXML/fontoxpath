import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import castToType from '../../dataTypes/castToType';

/**
 * @extends {Selector}
 */
class castAsOperator extends Selector {
	/**
	 * @param  {!Selector}  expression
	 * @param  {{prefix:string, namespaceURI:string, name}}    targetType
	 * @param  {!boolean}   allowsEmptySequence
	 */
	constructor (expression, targetType, allowsEmptySequence) {
		super(expression.specificity, { canBeStaticallyEvaluated: false });
		this._targetType = targetType.prefix ? `${targetType.prefix}:${targetType.name}` : targetType.name;
		if (this._targetType === 'xs:anyAtomicType' || this._targetType === 'xs:anySimpleType' || this._targetType === 'xs:NOTATION') {
			throw new Error('XPST0080: Casting to xs:anyAtomicType, xs:anySimpleType or xs:NOTATION is not permitted.');
		}

		if (targetType.namespaceURI) {
			throw new Error('Not implemented: casting expressions with a namespace URI.');
		}

		this._expression = expression;
		this._allowsEmptySequence = allowsEmptySequence;

	}

	evaluate (dynamicContext) {
		/**
		 * @type {Sequence}
		 */
		const evaluatedExpression = this._expression.evaluateMaybeStatically(dynamicContext).atomize(dynamicContext);
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
