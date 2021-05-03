import createAtomicValue from '../createAtomicValue';
import { BaseType, ValueType } from '../Value';
import CastResult from './CastResult';

const createAnyURIValue = (value) => createAtomicValue(value, { kind: BaseType.XSANYURI });

export default function castToAnyURI(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf({ kind: BaseType.XSSTRING }) || instanceOf({ kind: BaseType.XSUNTYPEDATOMIC })) {
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
