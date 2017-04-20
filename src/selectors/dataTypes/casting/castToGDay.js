import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createGDayValue = value => createAtomicValue(value, 'xs:gDay');

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<!../valueTypes/DateTime>}|{successful: boolean, error: !Error}}
 */
export default function castToGDay (value, instanceOf) {
	if (instanceOf('xs:gDay')) {
		return {
			successful: true,
			value: createGDayValue(value)
		};
	}
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return {
			successful: true,
			value: createGDayValue(value.convertToType('xs:gDay'))
		};
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return {
			successful: true,
			value: createGDayValue(DateTime.fromString(value))
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:gDay or any of its derived types.')
	};
}
