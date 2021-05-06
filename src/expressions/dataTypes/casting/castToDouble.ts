import createAtomicValue from '../createAtomicValue';
import { SequenceType } from '../Value';
import { BaseType } from '../BaseType';
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
				seqType: SequenceType.EXACTLY_ONE,
			}),
		};
	};
}
