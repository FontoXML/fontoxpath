import castToFloatLikeType from './castToFloatLikeType';
import createAtomicValue from '../createAtomicValue';

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<number>}|{successful: boolean, error: !Error}}
 */
export default function castToDouble (value, instanceOf) {
	const castResult = castToFloatLikeType(value, instanceOf, 'xs:double');
	if (!castResult.successful) {
		return castResult;
	}
	return {
		successful: true,
		value: createAtomicValue(castResult.value, 'xs:double')
	};
}
