import createAtomicValue from '../createAtomicValue';
import { BaseType, ValueType } from '../Value';
import CastResult from './CastResult';

export default function castToDecimal(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf({ kind: BaseType.XSINTEGER })) {
		return (value) => ({
			successful: true,
			value: createAtomicValue(value, { kind: BaseType.XSDECIMAL }),
		});
	}
	if (instanceOf({ kind: BaseType.XSFLOAT }) || instanceOf({ kind: BaseType.XSDOUBLE })) {
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
				value: createAtomicValue(value, { kind: BaseType.XSDECIMAL }),
			};
		};
	}
	if (instanceOf({ kind: BaseType.XSBOOLEAN })) {
		return (value) => ({
			successful: true,
			value: createAtomicValue(value ? 1 : 0, { kind: BaseType.XSDECIMAL }),
		});
	}

	if (instanceOf({ kind: BaseType.XSSTRING }) || instanceOf({ kind: BaseType.XSUNTYPEDATOMIC })) {
		return (value) => {
			const decimalValue = parseFloat(value);
			if (!isNaN(decimalValue) || isFinite(decimalValue)) {
				return {
					successful: true,
					value: createAtomicValue(decimalValue, { kind: BaseType.XSDECIMAL }),
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
