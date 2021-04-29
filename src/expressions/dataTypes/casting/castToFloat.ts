import createAtomicValue from '../createAtomicValue';
import { ValueType, BaseType } from '../Value';
import CastResult from './CastResult';
import castToFloatLikeType from './castToFloatLikeType';

export default function castToFloat(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	const caster = castToFloatLikeType(instanceOf, { kind: BaseType.XSFLOAT });
	return (value) => {
		const castResult = caster(value);
		if (!castResult.successful) {
			return castResult as CastResult;
		}
		return {
			successful: true,
			value: createAtomicValue(castResult.value, { kind: BaseType.XSFLOAT }),
		};
	};
}
