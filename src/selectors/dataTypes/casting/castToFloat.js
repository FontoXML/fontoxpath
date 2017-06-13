import castToFloatLikeType from './castToFloatLikeType';
import createAtomicValue from '../createAtomicValue';

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToFloat (instanceOf) {
	/**
	 * @type {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
	 */
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
