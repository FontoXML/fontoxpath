import Sequence from '../dataTypes/Sequence';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import StaticContext from '../StaticContext';
import ArrayValue from '../dataTypes/ArrayValue';


/**
 * @param  {!DynamicContext}  _dynamicContext
 * @param  {!ExecutionParameters}  _executionParameters
 * @param  {!StaticContext}  _staticContext
 * @param  {!Sequence}        arraySequence
 * @param  {!Sequence}        positionSequence
 * @return {!Sequence}
 */
export default function arrayGet (_dynamicContext, _executionParameters, _staticContext, arraySequence, positionSequence) {
	return positionSequence.mapAll(([position]) => arraySequence.mapAll(([array]) => {
		const positionValue = position.value;
		if (positionValue <= 0 || positionValue > /** @type {ArrayValue} */ (array).members.length) {
			throw new Error('FOAY0001: array position out of bounds.');
		}
		return /** @type {ArrayValue} */ (array).members[positionValue - 1];
	}));
}
