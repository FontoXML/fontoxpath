import createAtomicValue from '../createAtomicValue';

const createAnyURIValue = value => createAtomicValue(value, 'xs:anyURI');

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<string>}|{successful: boolean, error: !Error}}
 */
export default function castToAnyURI (value, instanceOf) {
	if (instanceOf('xs:anyURI')) {
		return {
			successful: true,
			value: createAnyURIValue(value)
		};
	}
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		return {
			successful: true,
			value: createAnyURIValue(value)
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:anyURI or any of its derived types.')
	};
}
