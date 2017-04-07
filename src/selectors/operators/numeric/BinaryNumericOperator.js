import Sequence from '../../dataTypes/Sequence';
import DecimalValue from '../../dataTypes/DecimalValue';
import IntegerValue from '../../dataTypes/IntegerValue';
import { castToType } from '../../dataTypes/conversionHelper';
import Selector from '../../Selector';

function executeOperator (kind, a, b) {
    switch (kind) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case 'div':
            return a / b;
        case 'idiv':
            return Math.abs(a / b);
        case 'mod':
            return a % b;
    }
}

/**
 * @extends {Selector}
 */
class BinaryNumericOperator extends Selector {
	/**
	 * @param  {string}    kind             One of +, -, *, div, idiv, mod
	 * @param  {Selector}  firstValueExpr   The selector evaluating to the first value to process
	 * @param  {Selector}  secondValueExpr  The selector evaluating to the second value to process
	 */
	constructor (kind, firstValueExpr, secondValueExpr) {
		super(
			firstValueExpr.specificity.add(secondValueExpr.specificity),
			Selector.RESULT_ORDERINGS.SORTED);
		this._firstValueExpr = firstValueExpr;
		this._secondValueExpr = secondValueExpr;

		this._kind = kind;
	}

	toString () {
		if (!this._stringifiedValue) {
			this._stringifiedValue = `(${this._kind} ${this._firstValueExpr.toString()} ${this._secondValueExpr.toString()}})`;
		}

		return this._stringifiedValue;
	}

	evaluate (dynamicContext) {
		const firstValueSequence = this._firstValueExpr.evaluate(dynamicContext).atomize(dynamicContext);
		if (firstValueSequence.isEmpty()) {
			// Shortcut, if the first part is empty, we can return empty.
			// As per spec, we do not have to evaluate the second part, though we could.
			return firstValueSequence;
		}
		const secondValueSequence = this._secondValueExpr.evaluate(dynamicContext).atomize(dynamicContext);
		if (secondValueSequence.isEmpty()) {
			return secondValueSequence;
		}

		if (!firstValueSequence.isSingleton() || !secondValueSequence.isSingleton()) {
			throw new Error('XPTY0004: the operands of the "' + this._kind + '" operator should be of type xs:numeric?.');
		}

		// Cast both to doubles, if they are xs:untypedAtomic
		let firstValue = firstValueSequence.value[0],
			secondValue = secondValueSequence.value[0];

		if (firstValue.instanceOfType('xs:untypedAtomic')) {
			firstValue = castToType(firstValue, 'xs:double');
		}

		if (secondValue.instanceOfType('xs:untypedAtomic')) {
			secondValue = castToType(secondValue, 'xs:double');
		}

		const result = executeOperator(this._kind, firstValue.value, secondValue.value);
		let typedResult;
		// Override for types
		if (this._kind === 'div') {
			typedResult = new DecimalValue(result);
		}
		else if (this._kind === 'idiv') {
			typedResult = new IntegerValue(result);
		}
		else {
			// For now, always return a decimal, it's all the same in JavaScript
			typedResult = new DecimalValue(result);
		}
		return Sequence.singleton(typedResult);
	}
}

export default BinaryNumericOperator;
