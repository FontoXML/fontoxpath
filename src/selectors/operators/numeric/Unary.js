import Sequence from '../../dataTypes/Sequence';
import DoubleValue from '../../dataTypes/DoubleValue';
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

	evaluate (dynamicContext) {
		var valueSequence = this._valueExpr.evaluate(dynamicContext);
		if (valueSequence.isEmpty()) {
			return Sequence.singleton(new DoubleValue(Number.NaN));
		}

		var value = valueSequence.value[0].atomize();
		if (value.instanceOfType('xs:integer') ||
			value.instanceOfType('xs:decimal') ||
			value.instanceOfType('xs:double') ||
			value.instanceOfType('xs:float')) {

			if (this._kind === '-') {
				// TODO: clone
				value.value = -value.value;
			}
			return Sequence.singleton(value);
		}

		return Sequence.singleton(new DoubleValue(Number.NaN));
	}
}

export default Unary;
