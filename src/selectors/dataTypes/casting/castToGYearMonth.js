import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createGYearMonthValue = value => createAtomicValue(value, 'xs:gYearMonth');

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToGYearMonth (instanceOf) {
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return value => ({
			successful: true,
			value: createGYearMonthValue(value.convertToType('xs:gYearMonth'))
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => ({
			successful: true,
			value: createGYearMonthValue(DateTime.fromString(value))
		});
	}
	return value => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:gYearMonth or any of its derived types.')
	});
}
