import atomize from '../../dataTypes/atomize';
import { BaseType } from '../../dataTypes/BaseType';
import castToType from '../../dataTypes/castToType';
import createAtomicValue from '../../dataTypes/createAtomicValue';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { SequenceType } from '../../dataTypes/Value';
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

			if (isSubtypeOf(value.type.kind, BaseType.XSUNTYPEDATOMIC)) {
				const castValue = castToType(value, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				}).value as number;
				return sequenceFactory.singleton(
					createAtomicValue(this._kind === '+' ? castValue : -castValue, {
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					})
				);
			}

			if (this._kind === '+') {
				if (
					isSubtypeOf(value.type.kind, BaseType.XSDECIMAL) ||
					isSubtypeOf(value.type.kind, BaseType.XSDOUBLE) ||
					isSubtypeOf(value.type.kind, BaseType.XSFLOAT) ||
					isSubtypeOf(value.type.kind, BaseType.XSINTEGER)
				) {
					return sequenceFactory.singleton(atomizedValues[0]);
				}
				return sequenceFactory.singleton(
					createAtomicValue(Number.NaN, {
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					})
				);
			}

			if (isSubtypeOf(value.type.kind, BaseType.XSINTEGER)) {
				return sequenceFactory.singleton(
					createAtomicValue((value.value as number) * -1, {
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					})
				);
			}
			if (isSubtypeOf(value.type.kind, BaseType.XSDECIMAL)) {
				return sequenceFactory.singleton(
					createAtomicValue((value.value as number) * -1, {
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					})
				);
			}
			if (isSubtypeOf(value.type.kind, BaseType.XSDOUBLE)) {
				return sequenceFactory.singleton(
					createAtomicValue((value.value as number) * -1, {
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					})
				);
			}
			if (isSubtypeOf(value.type.kind, BaseType.XSFLOAT)) {
				return sequenceFactory.singleton(
					createAtomicValue((value.value as number) * -1, {
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					})
				);
			}

			return sequenceFactory.singleton(
				createAtomicValue(Number.NaN, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			);
		});
	}
}

export default Unary;
