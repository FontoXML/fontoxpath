import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

import CastResult from './CastResult';

const createGYearValue = (value) => createAtomicValue(value, 'xs:gYear');

export default function castToGYear(instanceOf: (string) => boolean): (Value) => CastResult {
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return (value) => ({
			successful: true,
			value: createGYearValue(value.convertToType('xs:gYear')),
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return (value) => ({
			successful: true,
			value: createGYearValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gYear or any of its derived types.'
		),
	});
}
