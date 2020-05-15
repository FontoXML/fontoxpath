import createAtomicValue from '../dataTypes/createAtomicValue';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { MAP_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import concatSequences from '../util/concatSequences';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import zipSingleton from '../util/zipSingleton';
import mapGet from './builtInFunctions_maps_get';
import isSameMapKey from './isSameMapKey';

import FunctionDefinitionType from './FunctionDefinitionType';

const mapMerge: FunctionDefinitionType = function (
	dynamicContext,
	executionParameters,
	staticContext,
	mapSequence,
	optionMap
) {
	const duplicateKey = sequenceFactory.singleton(createAtomicValue('duplicates', 'xs:string'));
	const duplicationHandlingValueSequence = mapGet(
		dynamicContext,
		executionParameters,
		staticContext,
		optionMap,
		duplicateKey
	);

	const duplicationHandlingStrategy = duplicationHandlingValueSequence.isEmpty()
		? 'use-first'
		: duplicationHandlingValueSequence.first().value;
	return mapSequence.mapAll((allValues) =>
		sequenceFactory.singleton(
			new MapValue(
				allValues.reduce((resultingKeyValuePairs, map) => {
					(map as MapValue).keyValuePairs.forEach(function (keyValuePair) {
						const existingPairIndex = resultingKeyValuePairs.findIndex(function (
							existingPair
						) {
							return isSameMapKey(existingPair.key, keyValuePair.key);
						});

						if (existingPairIndex >= 0) {
							// Duplicate keys, use options to determine what to do
							switch (duplicationHandlingStrategy) {
								case 'reject':
									throw new Error(
										'FOJS0003: Duplicate encountered when merging maps.'
									);
								case 'use-last':
									// Use this one
									resultingKeyValuePairs.splice(
										existingPairIndex,
										1,
										keyValuePair
									);
									return;
								case 'combine':
									resultingKeyValuePairs.splice(existingPairIndex, 1, {
										key: keyValuePair.key,
										value: createDoublyIterableSequence(
											sequenceFactory.create(
												resultingKeyValuePairs[existingPairIndex]
													.value()
													.getAllValues()
													.concat(keyValuePair.value().getAllValues())
											)
										),
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
				}, [])
			)
		)
	);
};

const mapPut: FunctionDefinitionType = function (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence,
	keySequence,
	newValueSequence
) {
	return zipSingleton([mapSequence, keySequence], ([map, newKey]) => {
		const resultingKeyValuePairs = (map as MapValue).keyValuePairs.concat();
		const indexOfExistingPair = resultingKeyValuePairs.findIndex(function (existingPair) {
			return isSameMapKey(existingPair.key, newKey);
		});
		if (indexOfExistingPair >= 0) {
			// Duplicate keys, use options to determine what to do
			resultingKeyValuePairs.splice(indexOfExistingPair, 1, {
				key: newKey,
				value: createDoublyIterableSequence(newValueSequence),
			});
		} else {
			resultingKeyValuePairs.push({
				key: newKey,
				value: createDoublyIterableSequence(newValueSequence),
			});
		}
		return sequenceFactory.singleton(new MapValue(resultingKeyValuePairs));
	});
};

const mapEntry: FunctionDefinitionType = function (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	keySequence,
	value
) {
	return keySequence.map(
		(onlyKey) => new MapValue([{ key: onlyKey, value: createDoublyIterableSequence(value) }])
	);
};

const mapSize: FunctionDefinitionType = function (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence
) {
	return mapSequence.map((onlyMap) =>
		createAtomicValue((onlyMap as MapValue).keyValuePairs.length, 'xs:integer')
	);
};

const mapKeys: FunctionDefinitionType = function (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence
) {
	return zipSingleton([mapSequence], ([map]) =>
		sequenceFactory.create((map as MapValue).keyValuePairs.map((pair) => pair.key))
	);
};

const mapContains: FunctionDefinitionType = function (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence,
	keySequence
) {
	return zipSingleton([mapSequence, keySequence], ([map, key]) => {
		const doesContain = (map as MapValue).keyValuePairs.some((pair) =>
			isSameMapKey(pair.key, key)
		);
		return doesContain
			? sequenceFactory.singletonTrueSequence()
			: sequenceFactory.singletonFalseSequence();
	});
};

const mapRemove: FunctionDefinitionType = function (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence,
	keySequence
) {
	return zipSingleton([mapSequence], ([map]) => {
		const resultingKeyValuePairs = (map as MapValue).keyValuePairs.concat();
		return keySequence.mapAll((keys) => {
			keys.forEach(function (key) {
				const indexOfExistingPair = resultingKeyValuePairs.findIndex((existingPair) =>
					isSameMapKey(existingPair.key, key)
				);
				if (indexOfExistingPair >= 0) {
					resultingKeyValuePairs.splice(indexOfExistingPair, 1);
				}
			});
			return sequenceFactory.singleton(new MapValue(resultingKeyValuePairs));
		});
	});
};

const mapForEach: FunctionDefinitionType = function (
	dynamicContext,
	executionParameters,
	staticContext,
	mapSequence,
	functionItemSequence
) {
	return zipSingleton([mapSequence, functionItemSequence], ([map, functionItem]) => {
		return concatSequences(
			(map as MapValue).keyValuePairs.map(function (keyValuePair) {
				return functionItem.value.call(
					undefined,
					dynamicContext,
					executionParameters,
					staticContext,
					sequenceFactory.singleton(keyValuePair.key),
					keyValuePair.value()
				);
			})
		);
	});
};

export default {
	declarations: [
		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'contains',
			argumentTypes: ['map(*)', 'xs:anyAtomicType'],
			returnType: 'xs:boolean',
			callFunction: mapContains,
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'entry',
			argumentTypes: ['xs:anyAtomicType', 'item()*'],
			returnType: 'map(*)',
			callFunction: mapEntry,
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'for-each',
			// TODO: reimplement type checking by parsing the types
			// argumentTypes: ['map(*)', 'function(xs:anyAtomicType, item()*) as item()*'],
			argumentTypes: ['map(*)', 'function(*)'],
			returnType: 'item()*',
			callFunction: mapForEach,
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'get',
			argumentTypes: ['map(*)', 'xs:anyAtomicType'],
			returnType: 'item()*',
			callFunction: mapGet,
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'keys',
			argumentTypes: ['map(*)'],
			returnType: 'xs:anyAtomicType*',
			callFunction: mapKeys,
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'merge',
			argumentTypes: ['map(*)*', 'map(*)'],
			returnType: 'map(*)',
			callFunction: mapMerge,
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'merge',
			argumentTypes: ['map(*)*'],
			returnType: 'map(*)',
			callFunction(dynamicContext, executionParameters, staticContext, maps) {
				return mapMerge(
					dynamicContext,
					executionParameters,
					staticContext,
					maps,
					sequenceFactory.singleton(
						new MapValue([
							{
								key: createAtomicValue('duplicates', 'xs:string'),
								value: () =>
									sequenceFactory.singleton(
										createAtomicValue('use-first', 'xs:string')
									),
							},
						])
					)
				);
			},
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'put',
			argumentTypes: ['map(*)', 'xs:anyAtomicType', 'item()*'],
			returnType: 'map(*)',
			callFunction: mapPut,
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'remove',
			argumentTypes: ['map(*)', 'xs:anyAtomicType*'],
			returnType: 'map(*)',
			callFunction: mapRemove,
		},

		{
			namespaceURI: MAP_NAMESPACE_URI,
			localName: 'size',
			argumentTypes: ['map(*)'],
			returnType: 'xs:integer',
			callFunction: mapSize,
		},
	],
	functions: {
		get: mapGet,
		merge: mapMerge,
		put: mapPut,
		size: mapSize,
	},
};
