import createAtomicValue from '../createAtomicValue';

const createAnyURIValue = value => createAtomicValue(value, 'xs:anyURI');

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToAnyURI (instanceOf) {
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		return value => ({
			successful: true,
			value: createAnyURIValue(value)
		});
	}
	return () => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:anyURI or any of its derived types.')
	});
}
