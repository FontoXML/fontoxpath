import createAtomicValue from '../createAtomicValue';
import { ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createTimeValue = (value) => createAtomicValue(value, 'xs:time');

export default function castToTime(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf('xs:dateTime')) {
		return (value) => ({
			successful: true,
			value: createTimeValue(value.convertToType('xs:time')),
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return (value) => ({
			successful: true,
			value: createTimeValue(DateTime.fromString(value)),
		});
	}
	return (value) => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:time or any of its derived types.'
		),
	});
}
