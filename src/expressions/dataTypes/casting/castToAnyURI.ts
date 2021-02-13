import createAtomicValue from '../createAtomicValue';
import { ValueType } from '../Value';
import CastResult from './CastResult';

const createAnyURIValue = (value) => createAtomicValue(value, 'xs:anyURI');

export default function castToAnyURI(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		return (value) => ({
			successful: true,
			value: createAnyURIValue(value),
		});
	}

	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:anyURI or any of its derived types.'
		),
	});
}
