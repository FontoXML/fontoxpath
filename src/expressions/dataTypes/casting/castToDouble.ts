import createAtomicValue from '../createAtomicValue';
import { ValueType } from '../Value';
import CastResult from './CastResult';
import castToFloatLikeType from './castToFloatLikeType';

export default function castToDouble(
	instanceOf: (typeName: ValueType) => boolean,
): (value: any) => CastResult {
	const caster = castToFloatLikeType(instanceOf, ValueType.XSDOUBLE);
	return (value) => {
		const castResult = caster(value);
		if (!castResult.successful) {
			return castResult as CastResult;
		}
		return {
			successful: true,
			value: createAtomicValue(castResult.value, ValueType.XSDOUBLE),
		};
	};
}
