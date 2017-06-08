import isInstanceOfType from '../../dataTypes/isInstanceOfType';
import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import createAtomicValue from '../../dataTypes/createAtomicValue';
import atomize from '../../dataTypes/atomize';

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
		super(valueExpr.specificity, { canBeStaticallyEvaluated: false });
		this._valueExpr = valueExpr;

		this._kind = kind;
	}

	evaluate (dynamicContext) {
		var valueSequence = this._valueExpr.evaluateMaybeStatically(dynamicContext);
		if (valueSequence.isEmpty()) {
			return Sequence.singleton(createAtomicValue(Number.NaN, 'xs:double'));
		}

		var value = atomize(valueSequence.first(), dynamicContext);
		if (this._kind === '+') {
			if (isInstanceOfType(value, 'xs:decimal') ||
					isInstanceOfType(value, 'xs:double') ||
					isInstanceOfType(value, 'xs:float') ||
					isInstanceOfType(value, 'xs:integer')) {
				return valueSequence;
			}
			return Sequence.singleton(createAtomicValue(Number.NaN, 'xs:double'));
		}

		if (isInstanceOfType(value, 'xs:integer')) {
			return Sequence.singleton(createAtomicValue(-value.value, 'xs:integer'));
		}
		if (isInstanceOfType(value, 'xs:decimal')) {
			return Sequence.singleton(createAtomicValue(-value.value, 'xs:decimal'));
		}
		if (isInstanceOfType(value, 'xs:double')) {
			return Sequence.singleton(createAtomicValue(-value.value, 'xs:double'));
		}
		if (isInstanceOfType(value, 'xs:float')) {
			return Sequence.singleton(createAtomicValue(-value.value, 'xs:float'));
		}

		return Sequence.singleton(createAtomicValue(Number.NaN, 'xs:double'));
	}
}

export default Unary;
