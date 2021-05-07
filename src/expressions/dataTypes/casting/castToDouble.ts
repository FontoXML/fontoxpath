import { BaseType } from '../BaseType';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity } from '../Value';
import CastResult from './CastResult';
import castToFloatLikeType from './castToFloatLikeType';

export default function castToDouble(
	instanceOf: (typeName: BaseType) => boolean
): (value: any) => CastResult {
	const caster = castToFloatLikeType(instanceOf, BaseType.XSDOUBLE);
	return (value) => {
		const castResult = caster(value);
		if (!castResult.successful) {
			return castResult as CastResult;
		}
		return {
			successful: true,
			value: createAtomicValue(castResult.value, {
				kind: BaseType.XSDOUBLE,
				seqType: SequenceMultiplicity.EXACTLY_ONE,
			}),
		};
	};
}
