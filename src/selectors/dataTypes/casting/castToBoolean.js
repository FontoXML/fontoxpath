import createAtomicValue from '../createAtomicValue';

const createBooleanValue = value => createAtomicValue(value, 'xs:boolean');

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<boolean>}|{successful: boolean, error: !Error}}
 */
export default function castToBoolean (value, instanceOf) {
	if (instanceOf('xs:boolean')) {
		return {
			successful: true,
			value: createBooleanValue(value)
		};
	}
	if (instanceOf('xs:numeric')) {
		return {
			successful: true,
			value: createBooleanValue(!(value === 0 || isNaN(value)))
		};
	}
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		switch (value) {
			case 'true':
			case '1':
				return {
					successful: true,
					value: createBooleanValue(true)
				};
			case 'false':
			case '0':
				return {
					successful: true,
					value: createBooleanValue(false)
				};
		}
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:boolean or any of its derived types.')
	};
}
