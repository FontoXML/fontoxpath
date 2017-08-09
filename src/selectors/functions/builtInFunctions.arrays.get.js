/**
 * @param  {!../DynamicContext}  _dynamicContext
 * @param  {!../dataTypes/Sequence}        arraySequence
 * @param  {!../dataTypes/Sequence}        positionSequence
 * @return {!../dataTypes/Sequence}
 */
export default function arrayGet (_dynamicContext, arraySequence, positionSequence) {
	return positionSequence.mapAll(([position]) => arraySequence.mapAll(([array]) => {
		const positionValue = position.value;
		if (positionValue <= 0 || positionValue > array.members.length) {
			throw new Error('FOAY0001: array position out of bounds.');
		}
		return array.members[positionValue - 1];
	}));
}
