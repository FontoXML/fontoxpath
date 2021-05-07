import { BaseType } from '../BaseType';
import { falseBoolean, trueBoolean } from '../createAtomicValue';
import CastResult from './CastResult';

export default function castToBoolean(
	instanceOf: (typeName: BaseType) => boolean
): (value: any) => CastResult {
	if (instanceOf(BaseType.XSNUMERIC)) {
		return (value) => ({
			successful: true,
			value: value === 0 || isNaN(value) ? falseBoolean : trueBoolean,
		});
	}
	if (instanceOf(BaseType.XSSTRING) || instanceOf(BaseType.XSUNTYPEDATOMIC)) {
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
							'XPTY0004: Casting not supported from given type to xs:boolean or any of its derived types.'
						),
					};
			}
		};
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:boolean or any of its derived types.'
		),
	});
}
