import { BaseType } from '../BaseType';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity } from '../Value';
import CastResult from './CastResult';

export default function castToDecimal(
	instanceOf: (typeName: BaseType) => boolean
): (value: any) => CastResult {
	if (instanceOf(BaseType.XSINTEGER)) {
		return (value) => ({
			successful: true,
			value: createAtomicValue(value, {
				kind: BaseType.XSDECIMAL,
				seqType: SequenceMultiplicity.EXACTLY_ONE,
			}),
		});
	}
	if (instanceOf(BaseType.XSFLOAT) || instanceOf(BaseType.XSDOUBLE)) {
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
					seqType: SequenceMultiplicity.EXACTLY_ONE,
				}),
			};
		};
	}
	if (instanceOf(BaseType.XSBOOLEAN)) {
		return (value) => ({
			successful: true,
			value: createAtomicValue(value ? 1 : 0, {
				kind: BaseType.XSDECIMAL,
				seqType: SequenceMultiplicity.EXACTLY_ONE,
			}),
		});
	}

	if (instanceOf(BaseType.XSSTRING) || instanceOf(BaseType.XSUNTYPEDATOMIC)) {
		return (value) => {
			const decimalValue = parseFloat(value);
			if (!isNaN(decimalValue) || isFinite(decimalValue)) {
				return {
					successful: true,
					value: createAtomicValue(decimalValue, {
						kind: BaseType.XSDECIMAL,
						seqType: SequenceMultiplicity.EXACTLY_ONE,
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
