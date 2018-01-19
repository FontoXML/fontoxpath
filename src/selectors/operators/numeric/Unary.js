import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import createAtomicValue from '../../dataTypes/createAtomicValue';
import castToType from '../../dataTypes/castToType';

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
		return this._valueExpr.evaluateMaybeStatically(dynamicContext)
			.atomize(dynamicContext)
			.mapAll(atomizedValues => {
				if (atomizedValues.length === 0) {
					// Return the empty sequence when inputted the empty sequence
					return Sequence.empty();
				}

				if (atomizedValues.length > 1) {
					throw new Error('XPTY0004: The operand to a unary operator must be a sequence with a length less than one');
				}

				const value = atomizedValues[0];

				if (isSubtypeOf(value.type, 'xs:untypedAtomic')) {
					const castValue = castToType(value, 'xs:double').value;
					return Sequence.singleton(createAtomicValue(this._kind === '+' ? castValue : -castValue, 'xs:double'));
				}

				if (this._kind === '+') {
					if (isSubtypeOf(value.type, 'xs:decimal') ||
						isSubtypeOf(value.type, 'xs:double') ||
						isSubtypeOf(value.type, 'xs:float') ||
						isSubtypeOf(value.type, 'xs:integer')) {
						return Sequence.singleton(atomizedValues[0]);
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
			});
	}
}

export default Unary;
