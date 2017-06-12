import isSubtypeOf from '../../dataTypes/isSubtypeOf';
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
			if (isSubtypeOf(value.type, 'xs:decimal') ||
					isSubtypeOf(value.type, 'xs:double') ||
					isSubtypeOf(value.type, 'xs:float') ||
					isSubtypeOf(value.type, 'xs:integer')) {
				return valueSequence;
			}
			return Sequence.singleton(createAtomicValue(Number.NaN, 'xs:double'));
		}

		if (isSubtypeOf(value.type, 'xs:integer')) {
			return Sequence.singleton(createAtomicValue(-value.value, 'xs:integer'));
		}
		if (isSubtypeOf(value.type, 'xs:decimal')) {
			return Sequence.singleton(createAtomicValue(-value.value, 'xs:decimal'));
		}
		if (isSubtypeOf(value.type, 'xs:double')) {
			return Sequence.singleton(createAtomicValue(-value.value, 'xs:double'));
		}
		if (isSubtypeOf(value.type, 'xs:float')) {
			return Sequence.singleton(createAtomicValue(-value.value, 'xs:float'));
		}

		return Sequence.singleton(createAtomicValue(Number.NaN, 'xs:double'));
	}
}

export default Unary;
