import FunctionDefinitionType from './FunctionDefinitionType';
import ArrayValue from '../dataTypes/ArrayValue';

/**
 * @type {!FunctionDefinitionType}
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
