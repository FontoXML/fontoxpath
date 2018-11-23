import isSameMapKey from './isSameMapKey';
import Sequence from '../dataTypes/Sequence';

import zipSingleton from '../util/zipSingleton';

import MapValue from '../dataTypes/MapValue';
import FunctionDefinitionType from './FunctionDefinitionType';

/**
 * @type {!FunctionDefinitionType}
 */
export default function mapGet (_dynamicContext, _executionParameters, _staticContext, mapSequence, key) {
	return zipSingleton([mapSequence, key], ([map, keyValue]) => {
		var matchingPair = /** @type {MapValue} */ (map).keyValuePairs.find(function (keyValuePair) {
			return isSameMapKey(keyValuePair.key, keyValue);
		});

		if (!matchingPair) {
			return Sequence.empty();
		}
		return matchingPair.value();
	});
}
