import sequenceFactory from '../dataTypes/sequenceFactory';
import isSameMapKey from './isSameMapKey';

import zipSingleton from '../util/zipSingleton';

import MapValue from '../dataTypes/MapValue';
import FunctionDefinitionType from './FunctionDefinitionType';

const mapGet: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence,
	key
) {
	return zipSingleton([mapSequence, key], ([map, keyValue]) => {
		const matchingPair = (map as MapValue).keyValuePairs.find(function(keyValuePair) {
			return isSameMapKey(keyValuePair.key, keyValue);
		});

		if (!matchingPair) {
			return sequenceFactory.empty();
		}
		return matchingPair.value();
	});
};

export default mapGet;
