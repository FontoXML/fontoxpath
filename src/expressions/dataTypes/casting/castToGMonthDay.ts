import createAtomicValue from '../createAtomicValue';
import { ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGMonthDayValue = (value) => createAtomicValue(value, 'xs:gMonthDay');

export default function castToGMonthDay(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return (value) => ({
			successful: true,
			value: createGMonthDayValue(value.convertToType('xs:gMonthDay')),
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return (value) => ({
			successful: true,
			value: createGMonthDayValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gMonthDay or any of its derived types.'
		),
	});
}
