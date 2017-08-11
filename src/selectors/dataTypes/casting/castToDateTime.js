import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createDateTimeValue = value => createAtomicValue(value, 'xs:dateTime');

/**
 * @param   {function(string):boolean}       instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToDateTime (instanceOf) {
	if (instanceOf('xs:date')) {
		return value => ({
			successful: true,
			value: createDateTimeValue(value.convertToType('xs:dateTime'))
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => ({
			successful: true,
			value: createDateTimeValue(DateTime.fromString(value))
		});
	}
	return () => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:dateTime or any of its derived types.')
	});
}
