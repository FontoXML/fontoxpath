import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity, ValueType } from '../Value';
import CastResult from './CastResult';
import castToStringLikeType from './castToStringLikeType';

export default function castToString(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	const caster = castToStringLikeType(instanceOf);
	return (value) => {
		const castResult = caster(value);
		if (!castResult.successful) {
			return castResult;
		}

		return {
			successful: true,
			value: createAtomicValue(castResult.value, ValueType.XSSTRING),
		};
	};
}
