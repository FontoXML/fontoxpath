import castToStringLikeType from './castToStringLikeType';
import createAtomicValue from '../createAtomicValue';

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<string>}|{successful: boolean, error: !Error}}
 */
export default function castToUntypedAtomic (value, instanceOf) {
	const castResult = castToStringLikeType(value, instanceOf, 'xs:untypedAtomic');
	if (!castResult.successful) {
		return castResult;
	}

	return {
		successful: true,
		value: createAtomicValue(castResult.value, 'xs:untypedAtomic')
	};
}
