import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createGYearValue = value => createAtomicValue(value, 'xs:gYear');

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<!../valueTypes/DateTime>}|{successful: boolean, error: !Error}}
 */
export default function castToGYear (value, instanceOf) {
	if (instanceOf('xs:gYear')) {
		return {
			successful: true,
			value: createGYearValue(value)
		};
	}
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return {
			successful: true,
			value: createGYearValue(value.convertToType('xs:gYear'))
		};
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return {
			successful: true,
			value: createGYearValue(DateTime.fromString(value))
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:gYear or any of its derived types.')
	};
}
