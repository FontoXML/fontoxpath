import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType, ValueType } from '../Value';
import CastResult from './CastResult';

export default function castToDecimal(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf({ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: createAtomicValue(value, {
				kind: BaseType.XSDECIMAL,
				seqType: SequenceType.EXACTLY_ONE,
			}),
		});
	}
	if (
		instanceOf({ kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => {
			if (isNaN(value) || !isFinite(value)) {
				return {
					successful: false,
					error: new Error(`FOCA0002: Can not cast ${value} to xs:decimal`),
				};
			}
			if (Math.abs(value) > Number.MAX_VALUE) {
				return {
					successful: false,
					error: new Error(
						`FOAR0002: Can not cast ${value} to xs:decimal, it is out of bounds for JavaScript numbers`
					),
				};
			}
			return {
				successful: true,
				value: createAtomicValue(value, {
					kind: BaseType.XSDECIMAL,
					seqType: SequenceType.EXACTLY_ONE,
				}),
			};
		};
	}
	if (instanceOf({ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: createAtomicValue(value ? 1 : 0, {
				kind: BaseType.XSDECIMAL,
				seqType: SequenceType.EXACTLY_ONE,
			}),
		});
	}

	if (
		instanceOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => {
			const decimalValue = parseFloat(value);
			if (!isNaN(decimalValue) || isFinite(decimalValue)) {
				return {
					successful: true,
					value: createAtomicValue(decimalValue, {
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}),
				};
			}
			return {
				successful: false,
				error: new Error(`FORG0001: Can not cast ${value} to xs:decimal`),
			};
		};
	}

	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:decimal or any of its derived types.'
		),
	});
}
