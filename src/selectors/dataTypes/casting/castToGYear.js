import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createGYearValue = value => createAtomicValue(value, 'xs:gYear');

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToGYear (instanceOf) {
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return value => ({
			successful: true,
			value: createGYearValue(value.convertToType('xs:gYear'))
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => ({
			successful: true,
			value: createGYearValue(DateTime.fromString(value))
		});
	}
	return value => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:gYear or any of its derived types.')
	});
}
