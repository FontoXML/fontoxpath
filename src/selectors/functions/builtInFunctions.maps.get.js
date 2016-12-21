define([
	'./isSameMapKey',
	'../dataTypes/Sequence'
], function (
	isSameMapKey,
	Sequence
) {
	'use strict';

	return function mapGet (_dynamicContext, mapSequence, key) {
		var map = mapSequence.value[0];
		var matchingPair = map.keyValuePairs.find(function (keyValuePair) {
				return isSameMapKey(keyValuePair.key, key.value[0]);
			});

		if (!matchingPair) {
			return Sequence.empty();
		}
		return matchingPair.value;
	};
});
