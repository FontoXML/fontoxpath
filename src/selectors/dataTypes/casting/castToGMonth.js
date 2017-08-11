import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createGMonthValue = value => createAtomicValue(value, 'xs:gMonth');

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToGMonth (instanceOf) {
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return value => ({
			successful: true,
			value: createGMonthValue(value.convertToType('xs:gMonth'))
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => ({
			successful: true,
			value: createGMonthValue(DateTime.fromString(value))
		});
	}
	return value => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:gMonth or any of its derived types.')
	});
}
