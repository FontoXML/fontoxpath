import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createDateValue = value => createAtomicValue(value, 'xs:date');

/**
 * @param   {function(string):boolean}        instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToDate (instanceOf) {
	if (instanceOf('xs:dateTime')) {
		return value => ({
			successful: true,
			value: createDateValue(value.convertToType('xs:date'))
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => ({
			successful: true,
			value: createDateValue(DateTime.fromString(value))
		});
	}
	return () => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:date or any of its derived types.')
	});
}
