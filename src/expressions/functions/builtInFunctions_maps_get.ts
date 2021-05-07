import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import zipSingleton from '../util/zipSingleton';
import FunctionDefinitionType from './FunctionDefinitionType';
import isSameMapKey from './isSameMapKey';

const mapGet: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence,
	key
) => {
	return zipSingleton([mapSequence, key], ([map, keyValue]) => {
		const matchingPair = (map as MapValue).keyValuePairs.find((keyValuePair) => {
			return isSameMapKey(keyValuePair.key, keyValue);
		});

		if (!matchingPair) {
			return sequenceFactory.empty();
		}
		return matchingPair.value();
	});
};

export default mapGet;
