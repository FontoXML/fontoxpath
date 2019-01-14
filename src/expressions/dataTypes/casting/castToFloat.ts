import createAtomicValue from '../createAtomicValue';
import castToFloatLikeType from './castToFloatLikeType';

import CastResult from './CastResult';

export default function castToFlaot(instanceOf: (string) => boolean): (Value) => CastResult {
	const caster = castToFloatLikeType(instanceOf, 'xs:float');
	return value => {
		const castResult = caster(value);
		if (!castResult.successful) {
			return castResult;
		}
		return {
			successful: true,
			value: createAtomicValue(castResult.value, 'xs:float')
		};
	};
}
