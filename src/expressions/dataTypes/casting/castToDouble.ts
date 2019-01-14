import createAtomicValue from '../createAtomicValue';
import castToFloatLikeType from './castToFloatLikeType';

import CastResult from './CastResult';

export default function castToDouble(instanceOf: (string) => boolean): (Value) => CastResult {
	const caster = castToFloatLikeType(instanceOf, 'xs:double');
	return value => {
		const castResult = caster(value);
		if (!castResult.successful) {
			return castResult;
		}
		return {
			successful: true,
			value: createAtomicValue(castResult.value, 'xs:double')
		};
	};
}
