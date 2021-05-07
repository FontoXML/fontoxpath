import atomize from '../../dataTypes/atomize';
import castToType from '../../dataTypes/castToType';
import createAtomicValue from '../../dataTypes/createAtomicValue';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../../dataTypes/Value';
import Expression from '../../Expression';

class Unary extends Expression {
	private _kind: string;
	private _valueExpr: Expression;

	/**
	 * Positivese or negativise a value: +1 = 1, -1 = 0 - 1, -1 + 2 = 1, --1 = 1, etc
	 * @param  kind       Either + or -
	 * @param  valueExpr  The selector evaluating to the value to process
	 */
	constructor(kind: string, valueExpr: Expression) {
		super(valueExpr.specificity, [valueExpr], { canBeStaticallyEvaluated: false });
		this._valueExpr = valueExpr;

		this._kind = kind;
	}

	public evaluate(dynamicContext, executionParameters) {
		return atomize(
			this._valueExpr.evaluateMaybeStatically(dynamicContext, executionParameters),
			executionParameters
		).mapAll((atomizedValues) => {
			if (atomizedValues.length === 0) {
				// Return the empty sequence when inputted the empty sequence
				return sequenceFactory.empty();
			}

			if (atomizedValues.length > 1) {
				throw new Error(
					'XPTY0004: The operand to a unary operator must be a sequence with a length less than one'
				);
			}

			const value = atomizedValues[0];

			if (isSubtypeOf(value.type, ValueType.XSUNTYPEDATOMIC)) {
				const castValue = castToType(value, ValueType.XSDOUBLE).value as number;
				return sequenceFactory.singleton(
					createAtomicValue(
						this._kind === '+' ? castValue : -castValue,
						ValueType.XSDOUBLE
					)
				);
			}

			if (this._kind === '+') {
				if (
					isSubtypeOf(value.type, ValueType.XSDECIMAL) ||
					isSubtypeOf(value.type, ValueType.XSDOUBLE) ||
					isSubtypeOf(value.type, ValueType.XSFLOAT) ||
					isSubtypeOf(value.type, ValueType.XSINTEGER)
				) {
					return sequenceFactory.singleton(atomizedValues[0]);
				}
				return sequenceFactory.singleton(createAtomicValue(Number.NaN, ValueType.XSDOUBLE));
			}

			if (isSubtypeOf(value.type, ValueType.XSINTEGER)) {
				return sequenceFactory.singleton(
					createAtomicValue((value.value as number) * -1, ValueType.XSINTEGER)
				);
			}
			if (isSubtypeOf(value.type, ValueType.XSDECIMAL)) {
				return sequenceFactory.singleton(
					createAtomicValue((value.value as number) * -1, ValueType.XSDECIMAL)
				);
			}
			if (isSubtypeOf(value.type, ValueType.XSDOUBLE)) {
				return sequenceFactory.singleton(
					createAtomicValue((value.value as number) * -1, ValueType.XSDOUBLE)
				);
			}
			if (isSubtypeOf(value.type, ValueType.XSFLOAT)) {
				return sequenceFactory.singleton(
					createAtomicValue((value.value as number) * -1, ValueType.XSFLOAT)
				);
			}

			return sequenceFactory.singleton(createAtomicValue(Number.NaN, ValueType.XSDOUBLE));
		});
	}
}

export default Unary;
