import createAtomicValue from '../createAtomicValue';

const createDecimalValue = value => createAtomicValue(value, 'xs:decimal');

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<number>}|{successful: boolean, error: !Error}}
 */
export default function castToDecimal (value, instanceOf) {
	if (instanceOf('xs:decimal') || instanceOf('xs:integer')) {
		return {
			successful: true,
			value: createDecimalValue(value)
		};
	}
	if (instanceOf('xs:float') || instanceOf('xs:double')) {
		if (isNaN(value) || !isFinite(value)) {
			return {
				successful: false,
				error: new Error(`FOCA0002: Can not cast ${value} to xs:decimal`)
			};
		}
		if (Math.abs(value) > Number.MAX_VALUE) {
			return {
				successful: false,
				error: new Error(`FOAR0002: Can not cast ${value} to xs:decimal, it is out of bounds for JavaScript numbers`)
			};
		}
		return {
			successful: true,
			value: createDecimalValue(value)
		};
	}
	if (instanceOf('xs:boolean')) {
		return {
			successful: true,
			value: createDecimalValue(value ? 1 : 0)
		};
	}
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		const decimalValue = parseFloat(value);
		if (!isNaN(decimalValue) || isFinite(decimalValue)) {
			return {
				successful: true,
				value: createDecimalValue(decimalValue)
			};
		}
		return {
			successful: false,
			error: new Error(`FORG0001: Can not cast ${value} to xs:decimal`)
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:decimal or any of its derived types.')
	};
}
