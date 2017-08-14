import isSameMapKey from './isSameMapKey';
import mapGet from './builtInFunctions.maps.get';
import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import MapValue from '../dataTypes/MapValue';
import zipSingleton from '../util/zipSingleton';

/**
 * @param   {../DynamicContext}  dynamicContext
 * @param   {!Sequence}           mapSequence
 * @param   {!Sequence}           optionMap
 * @return  {!Sequence}
 */
function mapMerge (dynamicContext, mapSequence, optionMap) {
	const duplicateKey = Sequence.singleton(createAtomicValue('duplicates', 'xs:string'));
	const duplicationHandlingValueSequence = mapGet(dynamicContext, optionMap, duplicateKey);
	/**
	 * @type {string}
	 */
	const duplicationHandlingStrategy = duplicationHandlingValueSequence.isEmpty() ? 'use-first' : duplicationHandlingValueSequence.first().value;
	return mapSequence.mapAll(
		allValues =>
			Sequence.singleton(new MapValue(allValues.reduce((resultingKeyValuePairs, map) => {
				map.keyValuePairs.forEach(function (keyValuePair) {
					const existingPairIndex = resultingKeyValuePairs.findIndex(function (existingPair) {
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

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {!Sequence}           mapSequence
 * @param   {!Sequence}           keySequence
 * @param   {!Sequence}           newValueSequence
 * @return  {!Sequence}
 */
function mapPut (_dynamicContext, mapSequence, keySequence, newValueSequence) {
	return zipSingleton([mapSequence, keySequence], ([map, newKey]) => {
		/**
		 * @type {Array<{key: ../dataTypes/Value, value: Sequence}>}
		 */
		const resultingKeyValuePairs = map.keyValuePairs.concat();
		const indexOfExistingPair = resultingKeyValuePairs.findIndex(function (existingPair) {
			return isSameMapKey(existingPair.key, newKey);
		});
		if (indexOfExistingPair >= 0) {
			// Duplicate keys, use options to determine what to do
			resultingKeyValuePairs.splice(
				indexOfExistingPair,
				1,
				{
					key: newKey,
					value: newValueSequence
				});
		}
		else {
			resultingKeyValuePairs.push({
				key: newKey,
				value: newValueSequence
			});
		}
		return Sequence.singleton(new MapValue(resultingKeyValuePairs));
	});
}

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {!Sequence}           keySequence
 * @param   {!Sequence}           value
 * @return  {!Sequence}
 */
function mapEntry (_dynamicContext, keySequence, value) {
	return keySequence.map(onlyKey => new MapValue([{ key: onlyKey, value: value }]));
}

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {!Sequence}           mapSequence
 * @return  {!Sequence}
 */
function mapSize (_dynamicContext, mapSequence) {
	return mapSequence.map(onlyMap => createAtomicValue(onlyMap.keyValuePairs.length, 'xs:integer'));
}

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {!Sequence}           mapSequence
 * @return  {!Sequence}
 */
function mapKeys (_dynamicContext, mapSequence) {
	return zipSingleton([mapSequence], ([map]) => new Sequence(map.keyValuePairs.map(pair => pair.key)));
}

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {!Sequence}           mapSequence
 * @param   {!Sequence}           keySequence
 * @return  {!Sequence}
 */
function mapContains (_dynamicContext, mapSequence, keySequence) {
	return zipSingleton([mapSequence, keySequence], ([map, key]) => {
		const doesContain = map.keyValuePairs.some(pair => isSameMapKey(pair.key, key));
		return doesContain ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
	});
}

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {!Sequence}           mapSequence
 * @param   {!Sequence}           keySequence
 * @return  {!Sequence}
 */
function mapRemove (_dynamicContext, mapSequence, keySequence) {
	return zipSingleton([mapSequence], ([map]) => {
		/**
		 * @type {Array<{key: ../dataTypes/Value, value: Sequence}>}
		 */
		const resultingKeyValuePairs = map.keyValuePairs.concat();
		return keySequence.mapAll(keys => {
			keys.forEach(function (key) {
				const indexOfExistingPair = resultingKeyValuePairs.findIndex(existingPair => isSameMapKey(existingPair.key, key));
				if (indexOfExistingPair >= 0) {
					resultingKeyValuePairs.splice(
						indexOfExistingPair,
						1);
				}
			});
			return Sequence.singleton(new MapValue(resultingKeyValuePairs));
		});
	});
}

/**
 * @param   {../DynamicContext}  dynamicContext
 * @param   {!Sequence}           mapSequence
 * @param   {!Sequence}           functionItemSequence
 * @return  {!Sequence}
 */
function mapForEach (dynamicContext, mapSequence, functionItemSequence) {
	return zipSingleton([mapSequence, functionItemSequence], ([map, functionItem]) => {
		/**
		 * @type {Array<{key: ../dataTypes/Value, value: Sequence}>}
		 */
		const resultingKeyValuePairs = map.keyValuePairs.map(function (keyValuePair) {
			const newValue = functionItem.value.call(
				undefined,
				dynamicContext,
				Sequence.singleton(keyValuePair.key),
				keyValuePair.value);
			return {
				key: keyValuePair.key,
				value: newValue
			};
		});
		return Sequence.singleton(new MapValue(resultingKeyValuePairs));
	});
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
