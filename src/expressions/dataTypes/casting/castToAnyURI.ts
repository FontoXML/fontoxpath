import createAtomicValue from '../createAtomicValue';
import { BaseType, ValueType, SequenceType } from '../Value';
import CastResult from './CastResult';

const createAnyURIValue = (value) =>
	createAtomicValue(value, { kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE });

export default function castToAnyURI(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (
		instanceOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE })
	) {
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
