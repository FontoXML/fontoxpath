import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

import CastResult from './CastResult';

const createGYearMonthValue = (value) => createAtomicValue(value, 'xs:gYearMonth');

export default function castToGYearMonth(instanceOf: (string) => boolean): (Value) => CastResult {
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return (value) => ({
			successful: true,
			value: createGYearMonthValue(value.convertToType('xs:gYearMonth')),
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return (value) => ({
			successful: true,
			value: createGYearMonthValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gYearMonth or any of its derived types.'
		),
	});
}
