import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity, ValueType } from '../Value';
import CastResult from './CastResult';

const createAnyURIValue = (value: any): AtomicValue => createAtomicValue(value, ValueType.XSANYURI);

export default function castToAnyURI(
	instanceOf: (typeName: ValueType) => boolean
): (value: any) => CastResult {
	if (instanceOf(ValueType.XSSTRING) || instanceOf(ValueType.XSUNTYPEDATOMIC)) {
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
