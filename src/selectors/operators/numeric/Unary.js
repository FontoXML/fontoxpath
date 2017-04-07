import Sequence from '../../dataTypes/Sequence';
import DecimalValue from '../../dataTypes/DecimalValue';
import DoubleValue from '../../dataTypes/DoubleValue';
import FloatValue from '../../dataTypes/FloatValue';
import IntegerValue from '../../dataTypes/IntegerValue';
import Selector from '../../Selector';

/**
 * @extends {Selector}
 */
class Unary extends Selector {
	/**
	 * Positivese or negativise a value: +1 = 1, -1 = 0 - 1, -1 + 2 = 1, --1 = 1, etc
	 * @param  {string}    kind       Either + or -
	 * @param  {Selector}  valueExpr  The selector evaluating to the value to process
	 */
	constructor (kind, valueExpr) {
		super(valueExpr.specificity, Selector.RESULT_ORDERINGS.SORTED);
		this._valueExpr = valueExpr;

		this._kind = kind;
	}

	toString () {
		if (!this._stringifiedValue) {
			this._stringifiedValue = `(${this._kind} ${this._valueExpr.toString()}})`;
		}

		return this._stringifiedValue;
	}

	evaluate (dynamicContext) {
		var valueSequence = this._valueExpr.evaluate(dynamicContext);
		if (valueSequence.isEmpty()) {
			return Sequence.singleton(new DoubleValue(Number.NaN));
		}

		var value = valueSequence.value[0].atomize();
		if (this._kind === '+') {
			if (value.instanceOfType('xs:decimal') ||
					value.instanceOfType('xs:double') ||
					value.instanceOfType('xs:float') ||
					value.instanceOfType('xs:integer')) {
				return valueSequence;
			}

			return Sequence.singleton(new DoubleValue(Number.NaN));
		}

		if (value.instanceOfType('xs:integer')) {
			return Sequence.singleton(new IntegerValue(-value.value));
		}
		if (value.instanceOfType('xs:decimal')) {
			return Sequence.singleton(new DecimalValue(-value.value));
		}
		if (value.instanceOfType('xs:double')) {
			return Sequence.singleton(new DoubleValue(-value.value));
		}
		if (value.instanceOfType('xs:float')) {
			return Sequence.singleton(new FloatValue(-value.value));
		}

		return Sequence.singleton(new DoubleValue(Number.NaN));
	}
}

export default Unary;
