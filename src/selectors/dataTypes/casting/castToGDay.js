import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createGDayValue = value => createAtomicValue(value, 'xs:gDay');

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToGDay (instanceOf) {
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return value => ({
			successful: true,
			value: createGDayValue(value.convertToType('xs:gDay'))
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => ({
			successful: true,
			value: createGDayValue(DateTime.fromString(value))
		});
	}
	return () => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:gDay or any of its derived types.')
	});
}
