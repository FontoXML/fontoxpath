import createAtomicValue from '../createAtomicValue';
import { BaseType, ValueType } from '../Value';
import CastResult from './CastResult';

const createIntegerValue = (value) => createAtomicValue(value, { kind: BaseType.XSINTEGER });

export default function castToInteger(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf({ kind: BaseType.XSBOOLEAN })) {
		return (value) => ({
			successful: true,
			value: createIntegerValue(value ? 1 : 0),
		});
	}
	if (instanceOf({ kind: BaseType.XSNUMERIC })) {
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
						`FOAR0002: can not cast ${value} to xs:integer, it is out of bounds for JavaScript numbers.`
					),
				};
			}

			return {
				successful: true,
				value: createIntegerValue(integerValue),
			};
		};
	}
	if (instanceOf({ kind: BaseType.XSSTRING }) || instanceOf({ kind: BaseType.XSUNTYPEDATOMIC })) {
		return (value) => {
			const integerValue = parseInt(value, 10);
			if (isNaN(integerValue)) {
				return {
					successful: false,
					error: new Error(`FORG0001: Cannot cast "${value}" to xs:integer.`),
				};
			}
			if (!Number.isSafeInteger(integerValue)) {
				return {
					successful: false,
					error: new Error(
						`FOCA0003: can not cast ${value} to xs:integer, it is out of bounds for JavaScript numbers.`
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
			'XPTY0004: Casting not supported from given type to xs:integer or any of its derived types.'
		),
	});
}
