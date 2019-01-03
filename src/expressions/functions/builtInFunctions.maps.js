import isSameMapKey from './isSameMapKey';
import mapGet from './builtInFunctions.maps.get';
import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import MapValue from '../dataTypes/MapValue';
import zipSingleton from '../util/zipSingleton';
import concatSequences from '../util/concatSequences';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import { MAP_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import FunctionDefinitionType from './FunctionDefinitionType';

/**
 * @type {!FunctionDefinitionType}
 */
function mapMerge (dynamicContext, executionParameters, staticContext, mapSequence, optionMap) {
	const duplicateKey = Sequence.singleton(createAtomicValue('duplicates', 'xs:string'));
	const duplicationHandlingValueSequence = mapGet(
		dynamicContext,
		executionParameters,
		staticContext,
		optionMap,
		duplicateKey);
	/**
	 * @type {string}
	 */
	const duplicationHandlingStrategy = duplicationHandlingValueSequence.isEmpty() ? 'use-first' : duplicationHandlingValueSequence.first().value;
	return mapSequence.mapAll(
		allValues =>
			Sequence.singleton(new MapValue(allValues.reduce((resultingKeyValuePairs, map) => {
				/** @type {!MapValue} */(map).keyValuePairs.forEach(function (keyValuePair) {
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
										value: createDoublyIterableSequence(Sequence.create(
											resultingKeyValuePairs[existingPairIndex].value().getAllValues()
												.concat(keyValuePair.value().getAllValues())))
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
 * @type {!FunctionDefinitionType}
 */
function mapPut (_dynamicContext, _executionParameters, _staticContext, mapSequence, keySequence, newValueSequence) {
	return zipSingleton([mapSequence, keySequence], ([map, newKey]) => {

		const resultingKeyValuePairs = /** @type {!MapValue} */(map).keyValuePairs.concat();
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
					value: createDoublyIterableSequence(newValueSequence)
				});
		} else {
			resultingKeyValuePairs.push({
				key: newKey,
				value: createDoublyIterableSequence(newValueSequence)
			});
		}
		return Sequence.singleton(new MapValue(resultingKeyValuePairs));
	});
}

/**
 * @type {!FunctionDefinitionType}
 */
function mapEntry (_dynamicContext, _executionParameters, _staticContext, keySequence, value) {
	return keySequence.map(onlyKey => new MapValue([{ key: onlyKey, value: createDoublyIterableSequence(value) }]));
}

/**
 * @type {!FunctionDefinitionType}
 */
function mapSize (_dynamicContext, _executionParameters, _staticContext, mapSequence) {
	return mapSequence.map(onlyMap => createAtomicValue(
		/** @type {!MapValue} */(onlyMap).keyValuePairs.length,
		'xs:integer'));
}

/**
 * @type {!FunctionDefinitionType}
 */
function mapKeys (_dynamicContext, _executionParameters, _staticContext, mapSequence) {
	return zipSingleton([mapSequence], ([map]) => Sequence.create(/** @type {!MapValue} */(map).keyValuePairs.map(pair => pair.key)));
}

/**
 * @type {!FunctionDefinitionType}
 */
function mapContains (_dynamicContext, _executionParameters, _staticContext, mapSequence, keySequence) {
	return zipSingleton([mapSequence, keySequence], ([map, key]) => {
		const doesContain = /** @type {!MapValue} */(map).keyValuePairs.some(pair => isSameMapKey(pair.key, key));
		return doesContain ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
	});
}

/**
 * @type {!FunctionDefinitionType}
 */
function mapRemove (_dynamicContext, _executionParameters, _staticContext, mapSequence, keySequence) {
	return zipSingleton([mapSequence], ([map]) => {

		const resultingKeyValuePairs = /** @type {!MapValue} */(map).keyValuePairs.concat();
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
 * @type {!FunctionDefinitionType}
 */
function mapForEach (dynamicContext, executionParameters, staticContext, mapSequence, functionItemSequence) {
	return zipSingleton(
		[mapSequence, functionItemSequence],
		([map, functionItem]) => {
			return concatSequences(/** @type {!MapValue} */(map).keyValuePairs.map(function (keyValuePair) {
				return functionItem.value.call(
					undefined,
					dynamicContext,
					executionParameters,
					staticContext,
					Sequence.singleton(keyValuePair.key),
					keyValuePair.value());
			}));
		});
	}

export default {
	declarations: [
		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'contains',
			argumentTypes: ['map(*)', 'xs:anyAtomicType'],
			returnType: 'xs:boolean',
			callFunction: mapContains
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'entry',
			argumentTypes: ['xs:anyAtomicType', 'item()*'],
			returnType: 'map(*)',
			callFunction: mapEntry
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'for-each',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['map(*)', 'function(xs:anyAtomicType, item()*) as item()*'],
			argumentTypes: ['map(*)', 'function(*)'],
			returnType: 'item()*',
			callFunction: mapForEach
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'get',
			argumentTypes: ['map(*)', 'xs:anyAtomicType'],
			returnType: 'item()*',
			callFunction: mapGet
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'keys',
			argumentTypes: ['map(*)'],
			returnType: 'xs:anyAtomicType*',
			callFunction: mapKeys
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'merge',
			argumentTypes: ['map(*)*', 'map(*)'],
			returnType: 'map(*)',
			callFunction: mapMerge
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'merge',
			argumentTypes: ['map(*)*'],
			returnType: 'map(*)',
			callFunction: function (dynamicContext, executionParameters, staticContext, maps) {
				return mapMerge(
					dynamicContext,
					executionParameters,
					staticContext,
					maps,
					Sequence.singleton(new MapValue([{
						key: createAtomicValue('duplicates', 'xs:string'),
						value: () => Sequence.singleton(createAtomicValue('use-first', 'xs:string'))
					}])));
			}
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'put',
			argumentTypes: ['map(*)', 'xs:anyAtomicType', 'item()*'],
			returnType: 'map(*)',
			callFunction: mapPut
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'remove',
			argumentTypes: ['map(*)', 'xs:anyAtomicType*'],
			returnType: 'map(*)',
			callFunction: mapRemove
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'size',
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
