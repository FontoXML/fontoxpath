import isSameMapKey from './isSameMapKey';
import Sequence from '../dataTypes/Sequence';

import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import zipSingleton from '../util/zipSingleton';

import MapValue from '../dataTypes/MapValue';

/**
 * @param   {!DynamicContext}  _dynamicContext
 * @param   {!ExecutionParameters}  _executionParameters
 * @param   {!Sequence}        mapSequence
 * @param   {!Sequence}        key
 * @return  {!Sequence}
 */
export default function mapGet (_dynamicContext, _executionParameters, _staticContext, mapSequence, key) {
	return zipSingleton([mapSequence, key], ([map, keyValue]) => {
		var matchingPair = /** @type {MapValue} */ (map).keyValuePairs.find(function (keyValuePair) {
			return isSameMapKey(keyValuePair.key, keyValue);
		});

		if (!matchingPair) {
			return Sequence.empty();
		}
		return matchingPair.value;
	});
}
