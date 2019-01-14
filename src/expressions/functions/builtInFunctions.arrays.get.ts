import ArrayValue from '../dataTypes/ArrayValue';
import FunctionDefinitionType from './FunctionDefinitionType';

const arrayGet: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arraySequence,
	positionSequence
) {
	return positionSequence.mapAll(([position]) =>
		arraySequence.mapAll(([array]) => {
			const positionValue = position.value;
			if (positionValue <= 0 || positionValue > (array as ArrayValue).members.length) {
				throw new Error('FOAY0001: array position out of bounds.');
			}
			return (array as ArrayValue).members[positionValue - 1]();
		})
	);
};

export default arrayGet;
