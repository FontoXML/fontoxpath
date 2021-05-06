import createAtomicValue from '../createAtomicValue';
import { SequenceType } from '../Value';
import { BaseType } from '../BaseType';
import CastResult from './CastResult';
import castToStringLikeType from './castToStringLikeType';

export default function castToString(
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
				kind: BaseType.XSSTRING,
				seqType: SequenceType.EXACTLY_ONE,
			}),
		};
	};
}
