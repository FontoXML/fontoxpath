import createAtomicValue from '../createAtomicValue';
import { ValueType, BaseType } from '../Value';
import CastResult from './CastResult';
import castToFloatLikeType from './castToFloatLikeType';

export default function castToDouble(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	const caster = castToFloatLikeType(instanceOf, { kind: BaseType.XSDOUBLE });
	return (value) => {
		const castResult = caster(value);
		if (!castResult.successful) {
			return castResult as CastResult;
		}
		return {
			successful: true,
			value: createAtomicValue(castResult.value, { kind: BaseType.XSDOUBLE }),
		};
	};
}
