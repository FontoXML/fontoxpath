import createAtomicValue from '../createAtomicValue';
import { ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGMonthValue = (value) => createAtomicValue(value, 'xs:gMonth');

export default function castToGMonth(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return (value) => ({
			successful: true,
			value: createGMonthValue(value.convertToType('xs:gMonth')),
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return (value) => ({
			successful: true,
			value: createGMonthValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gMonth or any of its derived types.'
		),
	});
}
