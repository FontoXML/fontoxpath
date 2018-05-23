import isSameMapKey from './isSameMapKey';
import Sequence from '../dataTypes/Sequence';
import DynamicContext from '../DynamicContext';
import zipSingleton from '../util/zipSingleton';

/**
 * @param   {!DynamicContext}  _dynamicContext
 * @param   {!../ExecutionParameters}  _executionParameters
 * @param   {!Sequence}        mapSequence
 * @param   {!Sequence}        key
 * @return  {!Sequence}
 */
export default function mapGet (_dynamicContext, _executionParameters, mapSequence, key) {
	return zipSingleton([mapSequence, key], ([map, keyValue]) => {
		var matchingPair = map.keyValuePairs.find(function (keyValuePair) {
			return isSameMapKey(keyValuePair.key, keyValue);
		});

		if (!matchingPair) {
			return Sequence.empty();
		}
		return matchingPair.value;
	});
}
