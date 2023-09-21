import { errFORG0001 } from '../../../expressions/XPathErrors';
import createAtomicValue from '../createAtomicValue';
import { ValueType } from '../Value';
import CastResult from './CastResult';

const createIntegerValue = (value: number) => createAtomicValue(value, ValueType.XSINTEGER);

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

			if (!Number.isSafeInteger(integerValue)) {
				return {
					successful: false,
					error: new Error(
						`FOAR0002: can not cast ${value} to xs:integer, it is out of bounds for JavaScript numbers.`,
					),
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
			const integerValue = parseInt(value, 10);
			if (isNaN(integerValue)) {
				return {
					successful: false,
					error: errFORG0001(value, ValueType.XSINTEGER),
				};
			}
			if (!Number.isSafeInteger(integerValue)) {
				return {
					successful: false,
					error: new Error(
						`FOCA0003: can not cast ${value} to xs:integer, it is out of bounds for JavaScript numbers.`,
					),
				};
			}

			return {
				successful: true,
				value: createIntegerValue(integerValue),
			};
		};
	}
	return (value) => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:integer or any of its derived types.',
		),
	});
}
