import { BaseType } from '../BaseType';
import createAtomicValue from '../createAtomicValue';
import { SequenceType } from '../Value';
import CastResult from './CastResult';
import castToStringLikeType from './castToStringLikeType';

export default function castToUntypedAtomic(
	instanceOf: (typeName: BaseType) => boolean
): (value) => CastResult {
	const caster = castToStringLikeType(instanceOf);
	return (value) => {
		const castResult = caster(value);
		if (!castResult.successful) {
			return castResult;
		}

		return {
			successful: true,
			value: createAtomicValue(castResult.value, {
				kind: BaseType.XSUNTYPEDATOMIC,
				seqType: SequenceType.EXACTLY_ONE,
			}),
		};
	};
}
