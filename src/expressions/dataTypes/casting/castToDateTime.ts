import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createDateTimeValue = (value) => createAtomicValue(value, 'xs:dateTime');

export default function castToDateTime(instanceOf: (string) => boolean): (Value) => CastResult {
	if (instanceOf('xs:date')) {
		return (value) => ({
			successful: true,
			value: createDateTimeValue(value.convertToType('xs:dateTime')),
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return (value) => ({
			successful: true,
			value: createDateTimeValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:dateTime or any of its derived types.'
		),
	});
}
