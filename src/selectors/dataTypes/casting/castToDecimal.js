import createAtomicValue from '../createAtomicValue';

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToDecimal (instanceOf) {
	if (instanceOf('xs:integer')) {
		return value => ({
			successful: true,
			value: createAtomicValue(value, 'xs:decimal')
		});
	}
	if (instanceOf('xs:float') || instanceOf('xs:double')) {
		return value => {

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
				value: createAtomicValue(value, 'xs:decimal')
			};
		};
	}
	if (instanceOf('xs:boolean')) {
		return value => ({
			successful: true,
			value: createAtomicValue(value ? 1 : 0, 'xs:decimal')
		});
	}

	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		return value => {
			const decimalValue = parseFloat(value);
			if (!isNaN(decimalValue) || isFinite(decimalValue)) {
				return {
					successful: true,
					value: createAtomicValue(decimalValue, 'xs:decimal')
				};
			}
			return {
				successful: false,
				error: new Error(`FORG0001: Can not cast ${value} to xs:decimal`)
			};
		};
	}

	return () => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:decimal or any of its derived types.')
	});
}
