import createAtomicValue from '../createAtomicValue';

const createIntegerValue = value => createAtomicValue(value, 'xs:integer');

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<number>}|{successful: boolean, error: !Error}}
 */
export default function castToInteger (value, instanceOf) {
	if (instanceOf('xs:boolean')) {
		return {
			successful: true,
			value: createIntegerValue(value ? 1 : 0)
		};
	}
	if (instanceOf('xs:numeric')) {
		const integerValue = Math.trunc(value);
		if (!isFinite(integerValue) || isNaN(integerValue)) {
			return {
				successful: false,
				error: new Error(`FOCA0002: can not cast ${value} to xs:integer`)
			};
		}

		if (!Number.isSafeInteger(integerValue)) {
			return {
				successful: false,
				error: new Error(`FOAR0002: can not cast ${value} to xs:integer, it is out of bounds for JavaScript numbers.`)
			};
		}

		return {
			successful: true,
			value: createIntegerValue(integerValue)
		};
	}
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		const integerValue = parseInt(value, 10);
		if (isNaN(integerValue)) {
			return {
				successful: false,
				error: new Error(`FORG0001: Cannot cast "${value}" to xs:integer.`)
			};
		}
		if (!Number.isSafeInteger(integerValue)) {
			return {
				successful: false,
				error: new Error(`FOCA0003: can not cast ${value} to xs:integer, it is out of bounds for JavaScript numbers.`)
			};
		}

		return {
			successful: true,
			value: createIntegerValue(integerValue)
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:integer or any of its derived types.')
	};
}
