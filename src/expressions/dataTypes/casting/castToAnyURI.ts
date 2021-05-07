import AtomicValue from '../AtomicValue';
import { BaseType } from '../BaseType';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity } from '../Value';
import CastResult from './CastResult';

const createAnyURIValue = (value: any): AtomicValue =>
	createAtomicValue(value, {
		kind: BaseType.XSANYURI,
		seqType: SequenceMultiplicity.EXACTLY_ONE,
	});

export default function castToAnyURI(
	instanceOf: (typeName: BaseType) => boolean
): (value: any) => CastResult {
	if (instanceOf(BaseType.XSSTRING) || instanceOf(BaseType.XSUNTYPEDATOMIC)) {
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
