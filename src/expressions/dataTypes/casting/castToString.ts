import createAtomicValue from '../createAtomicValue';
import castToStringLikeType from './castToStringLikeType';

import CastResult from './CastResult';

export default function castToString(instanceOf: (string) => boolean): (Value) => CastResult {
	const caster = castToStringLikeType(instanceOf);
	return value => {
		const castResult = caster(value);
		if (!castResult.successful) {
			return castResult;
		}

		return {
			successful: true,
			value: createAtomicValue(castResult.value, 'xs:string')
		};
	};
}
