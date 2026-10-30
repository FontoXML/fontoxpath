import { errXPTY0004 } from '../../../expressions/XPathErrors';
import createAtomicValue from '../createAtomicValue';
import { ValueType } from '../Value';
import { Decimal } from '../valueTypes/Decimal';
import CastResult from './CastResult';

const createIntegerValue = (value: number | Decimal) =>
	createAtomicValue(value, ValueType.XSINTEGER);

export default function castToInteger(
	instanceOf: (typeName: ValueType) => boolean,
): (value: any) => CastResult {
	if (instanceOf(ValueType.XSBOOLEAN)) {
		return (value) => ({
			successful: true,
			value: createIntegerValue(value ? 1 : 0),
		});
	}
	if (instanceOf(ValueType.XSNUMERIC)) {
		return (value) => {
			const integerValue = Math.trunc(value);
			if (!isFinite(integerValue) || isNaN(integerValue)) {
				return {
					successful: false,
					error: new Error(`FOCA0002: can not cast ${value} to xs:integer`),
				};
			}

			return {
				successful: true,
				value: createIntegerValue(integerValue),
			};
		};
	}
	if (instanceOf(ValueType.XSSTRING) || instanceOf(ValueType.XSUNTYPEDATOMIC)) {
		return (value) => {
			return {
				successful: true,
				value: createIntegerValue(Decimal.fromString(value)),
			};
		};
	}
	return (_value) => ({
		successful: false,
		error: errXPTY0004(
			'Casting not supported from given type to xs:integer or any of its derived types.',
		),
	});
}
