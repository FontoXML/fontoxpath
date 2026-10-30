import { falseBoolean, trueBoolean } from '../createAtomicValue';
import { ValueType } from '../Value';
import { Decimal } from '../valueTypes/Decimal';
import CastResult from './CastResult';

export default function castToBoolean(
	instanceOf: (typeName: ValueType) => boolean,
): (value: any) => CastResult {
	if (instanceOf(ValueType.XSNUMERIC)) {
		if (instanceOf(ValueType.XSDECIMAL)) {
			return (value) => ({
				successful: true,
				value: (value as Decimal).equals(Decimal.ZERO) ? falseBoolean : trueBoolean,
			});
		}
		return (value) => ({
			successful: true,
			value: value === 0 || isNaN(value) ? falseBoolean : trueBoolean,
		});
	}
	if (instanceOf(ValueType.XSSTRING) || instanceOf(ValueType.XSUNTYPEDATOMIC)) {
		return (value) => {
			switch (value) {
				case 'true':
				case '1':
					return {
						successful: true,
						value: trueBoolean,
					};
				case 'false':
				case '0':
					return {
						successful: true,
						value: falseBoolean,
					};
				default:
					return {
						successful: false,
						error: new Error(
							'XPTY0004: Casting not supported from given type to xs:boolean or any of its derived types.',
						),
					};
			}
		};
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:boolean or any of its derived types.',
		),
	});
}
