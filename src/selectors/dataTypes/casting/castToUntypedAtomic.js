import castToStringLikeType from './castToStringLikeType';
import createAtomicValue from '../createAtomicValue';

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToUntypedAtomic (instanceOf) {
	/**
	 * @type {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
	 */
	const caster = castToStringLikeType(instanceOf);
	return value => {
		const castResult = caster(value);
		if (!castResult.successful) {
			return castResult;
		}

		return {
			successful: true,
			value: createAtomicValue(castResult.value, 'xs:untypedAtomic')
		};
	};
}
