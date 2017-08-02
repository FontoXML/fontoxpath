import isSameMapKey from './isSameMapKey';
import mapGet from './builtInFunctions.maps.get';
import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import MapValue from '../dataTypes/MapValue';

function mapMerge (dynamicContext, mapSequence, optionMap) {
	var duplicateKey = Sequence.singleton(createAtomicValue('duplicates', 'xs:string'));
	var duplicationHandlingValueSequence = mapGet(dynamicContext, optionMap, duplicateKey);
	var duplicationHandlingStrategy = duplicationHandlingValueSequence.isEmpty() ? 'use-first' : duplicationHandlingValueSequence.first().value;
	return mapSequence.mapAll(
		allValues =>
			Sequence.singleton(new MapValue(allValues.reduce((resultingKeyValuePairs, map) => {
				map.keyValuePairs.forEach(function (keyValuePair) {
					var existingPairIndex = resultingKeyValuePairs.findIndex(function (existingPair) {
						return isSameMapKey(existingPair.key, keyValuePair.key);
					});

					if (existingPairIndex >= 0) {
						// Duplicate keys, use options to determine what to do
						switch (duplicationHandlingStrategy) {
							case 'reject':
								throw new Error('FOJS0003: Duplicate encountered when merging maps.');
							case 'use-last':
								// Use this one
								resultingKeyValuePairs.splice(existingPairIndex, 1, keyValuePair);
								return;
							case 'combine':
								resultingKeyValuePairs.splice(
									existingPairIndex,
									1,
									{
										key: keyValuePair.key,
										value: new Sequence(
											resultingKeyValuePairs[existingPairIndex].value.getAllValues()
												.concat(keyValuePair.value.getAllValues()))
									});
								return;
							case 'use-any':
							case 'use-first':
							default:
								return;
						}
					}
					resultingKeyValuePairs.push(keyValuePair);
				});
				return resultingKeyValuePairs;
			}, []))));
}

function mapPut (_dynamicContext, mapSequence, keySequence, value) {
	var resultingKeyValuePairs = mapSequence.first().keyValuePairs.concat();
	var indexOfExistingPair = resultingKeyValuePairs.findIndex(function (existingPair) {
			return isSameMapKey(existingPair.key, keySequence.first());
		});
	if (indexOfExistingPair >= 0) {
		// Duplicate keys, use options to determine what to do
		resultingKeyValuePairs.splice(
			indexOfExistingPair,
			1,
			{
				key: keySequence.first(),
				value: value
			});
	}
	else {
		resultingKeyValuePairs.push({
			key: keySequence.first(),
			value: value
		});
	}
	return Sequence.singleton(new MapValue(resultingKeyValuePairs));
}

function mapEntry (_dynamicContext, keySequence, value) {
	return Sequence.singleton(new MapValue([{ key: keySequence.first(), value: value }]));
}

function mapSize (_dynamicContext, mapSequence) {
	return Sequence.singleton(createAtomicValue(mapSequence.first().keyValuePairs.length, 'xs:integer'));
}

function mapKeys (_dynamicContext, mapSequence) {
	var keys = mapSequence.first().keyValuePairs.map(
			function (pair) {
				return pair.key;
			});
	return new Sequence(keys);
}

function mapContains (_dynamicContext, mapSequence, keySequence) {
	var doesContain = mapSequence.first().keyValuePairs.some(
			function (pair) {
				return isSameMapKey(pair.key, keySequence.first());
			});
	return doesContain ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
}

function mapRemove (_dynamicContext, mapSequence, keySequence) {
	var resultingKeyValuePairs = mapSequence.first().keyValuePairs.concat();
	keySequence.getAllValues().forEach(function (key) {
		var indexOfExistingPair = resultingKeyValuePairs.findIndex(function (existingPair) {
				return isSameMapKey(existingPair.key, key);
			});
		if (indexOfExistingPair >= 0) {
			resultingKeyValuePairs.splice(
				indexOfExistingPair,
				1);
		}
	});
	return Sequence.singleton(new MapValue(resultingKeyValuePairs));
}

function mapForEach (dynamicContext, mapSequence, functionItemSequence) {
	var resultingKeyValuePairs = mapSequence.first().keyValuePairs.map(function (keyValuePair) {
			var newValue = functionItemSequence.first().value
				.call(undefined, dynamicContext, Sequence.singleton(keyValuePair.key), keyValuePair.value);
			return {
				key: keyValuePair.key,
				value: newValue
			};
		});
	return Sequence.singleton(new MapValue(resultingKeyValuePairs));
}

export default {
	declarations: [
		{
			name: 'map:contains',
			argumentTypes: ['map(*)', 'xs:anyAtomicType'],
			returnType: 'xs:boolean',
			callFunction: mapContains
		},

		{
			name: 'map:entry',
			argumentTypes: ['xs:anyAtomicType', 'item()*'],
			returnType: 'map(*)',
			callFunction: mapEntry
		},

		{
			name: 'map:for-each',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['map(*)', 'function(xs:anyAtomicType, item()*) as item()*'],
			argumentTypes: ['map(*)', 'function(*)'],
			returnType: 'item()*',
			callFunction: mapForEach
		},

		{
			name: 'map:get',
			argumentTypes: ['map(*)', 'xs:anyAtomicType'],
			returnType: 'item()*',
			callFunction: mapGet
		},

		{
			name: 'map:keys',
			argumentTypes: ['map(*)'],
			returnType: 'xs:anyAtomicType*',
			callFunction: mapKeys
		},

		{
			name: 'map:merge',
			argumentTypes: ['map(*)*', 'map(*)'],
			returnType: 'map(*)',
			callFunction: mapMerge
		},

		{
			name: 'map:merge',
			argumentTypes: ['map(*)*'],
			returnType: 'map(*)',
			callFunction: function (dynamicContext, maps) {
				return mapMerge(
					dynamicContext,
					maps,
					Sequence.singleton(new MapValue([{
						key: createAtomicValue('duplicates', 'xs:string'),
						value: Sequence.singleton(createAtomicValue('use-first', 'xs:string'))
					}])));
			}
		},

		{
			name: 'map:put',
			argumentTypes: ['map(*)', 'xs:anyAtomicType', 'item()*'],
			returnType: 'map(*)',
			callFunction: mapPut
		},

		{
			name: 'map:remove',
			argumentTypes: ['map(*)', 'xs:anyAtomicType*'],
			returnType: 'map(*)',
			callFunction: mapRemove
		},

		{
			name: 'map:size',
			argumentTypes: ['map(*)'],
			returnType: 'xs:integer',
			callFunction: mapSize
		}

	],
	functions: {
		get: mapGet,
		merge: mapMerge,
		put: mapPut,
		size: mapSize
	}
};
