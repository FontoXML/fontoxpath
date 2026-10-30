import createAtomicValue from '../createAtomicValue';
import { ValueType } from '../Value';
import { Decimal } from '../valueTypes/Decimal';
import CastResult from './CastResult';

export default function castToDecimal(
	instanceOf: (typeName: ValueType) => boolean,
): (value: any) => CastResult {
	if (instanceOf(ValueType.XSINTEGER)) {
		return (value) => ({
			successful: true,
			value: createAtomicValue(Decimal.coerce(value), ValueType.XSDECIMAL),
		});
	}
	if (instanceOf(ValueType.XSFLOAT) || instanceOf(ValueType.XSDOUBLE)) {
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
						`FOAR0002: Can not cast ${value} to xs:decimal, it is out of bounds for JavaScript numbers`,
					),
				};
			}
			return {
				successful: true,
				value: createAtomicValue(Decimal.coerce(value), ValueType.XSDECIMAL),
			};
		};
	}
	if (instanceOf(ValueType.XSBOOLEAN)) {
		return (value) => ({
			successful: true,
			value: createAtomicValue(Decimal.coerce(value ? 1 : 0), ValueType.XSDECIMAL),
		});
	}

	if (instanceOf(ValueType.XSSTRING) || instanceOf(ValueType.XSUNTYPEDATOMIC)) {
		return (value) => {
			try {
				return {
					successful: true,
					value: createAtomicValue(Decimal.fromString(value), ValueType.XSDECIMAL),
				};
			} catch (e) {
				return {
					successful: false,
					error: e as Error,
				};
			}
		};
	}

	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:decimal or any of its derived types.',
		),
	});
}
