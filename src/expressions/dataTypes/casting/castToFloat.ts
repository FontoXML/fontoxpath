import createAtomicValue from '../createAtomicValue';
import { ValueType } from '../Value';
import CastResult from './CastResult';
import castToFloatLikeType from './castToFloatLikeType';

export default function castToFloat(
	instanceOf: (typeName: ValueType) => boolean,
): (value: any) => CastResult {
	const caster = castToFloatLikeType(instanceOf, ValueType.XSFLOAT);
	return (value) => {
		const castResult = caster(value);
		if (!castResult.successful) {
			return castResult as CastResult;
		}
		return {
			successful: true,
			value: createAtomicValue(castResult.value, ValueType.XSFLOAT),
		};
	};
}
