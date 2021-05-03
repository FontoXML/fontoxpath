import createAtomicValue from '../dataTypes/createAtomicValue';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { BaseType } from '../dataTypes/Value';
import { MAP_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import concatSequences from '../util/concatSequences';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import zipSingleton from '../util/zipSingleton';
import mapGet from './builtInFunctions_maps_get';
import isSameMapKey from './isSameMapKey';

import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const mapMerge: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	mapSequence,
	optionMap
) => {
	const duplicateKey = sequenceFactory.singleton(
		createAtomicValue('duplicates', { kind: BaseType.XSSTRING })
	);
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
					(map as MapValue).keyValuePairs.forEach((keyValuePair) => {
						const existingPairIndex = resultingKeyValuePairs.findIndex((existingPair) =>
							isSameMapKey(existingPair.key, keyValuePair.key)
						);

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

const mapPut: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence,
	keySequence,
	newValueSequence
) => {
	return zipSingleton([mapSequence, keySequence], ([map, newKey]) => {
		const resultingKeyValuePairs = (map as MapValue).keyValuePairs.concat();
		const indexOfExistingPair = resultingKeyValuePairs.findIndex((existingPair) =>
			isSameMapKey(existingPair.key, newKey)
		);
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

const mapEntry: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	keySequence,
	value
) => {
	return keySequence.map(
		(onlyKey) => new MapValue([{ key: onlyKey, value: createDoublyIterableSequence(value) }])
	);
};

const mapSize: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence
) => {
	return mapSequence.map((onlyMap) =>
		createAtomicValue((onlyMap as MapValue).keyValuePairs.length, { kind: BaseType.XSINTEGER })
	);
};

const mapKeys: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence
) => {
	return zipSingleton([mapSequence], ([map]) =>
		sequenceFactory.create((map as MapValue).keyValuePairs.map((pair) => pair.key))
	);
};

const mapContains: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence,
	keySequence
) => {
	return zipSingleton([mapSequence, keySequence], ([map, key]) => {
		const doesContain = (map as MapValue).keyValuePairs.some((pair) =>
			isSameMapKey(pair.key, key)
		);
		return doesContain
			? sequenceFactory.singletonTrueSequence()
			: sequenceFactory.singletonFalseSequence();
	});
};

const mapRemove: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence,
	keySequence
) => {
	return zipSingleton([mapSequence], ([map]) => {
		const resultingKeyValuePairs = (map as MapValue).keyValuePairs.concat();
		return keySequence.mapAll((keys) => {
			keys.forEach((key) => {
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

const mapForEach: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	mapSequence,
	itemSequence
) => {
	return zipSingleton([mapSequence, itemSequence], ([map, item]) =>
		concatSequences(
			(map as MapValue).keyValuePairs.map((keyValuePair) =>
				item.value.call(
					undefined,
					dynamicContext,
					executionParameters,
					staticContext,
					sequenceFactory.singleton(keyValuePair.key),
					keyValuePair.value()
				)
			)
		)
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: MAP_NAMESPACE_URI,
		localName: 'contains',
		argumentTypes: [{ kind: BaseType.MAP, items: [] }, { kind: BaseType.XSANYATOMICTYPE }],
		returnType: { kind: BaseType.XSBOOLEAN },
		callFunction: mapContains,
	},

	{
		namespaceURI: MAP_NAMESPACE_URI,
		localName: 'entry',
		argumentTypes: [
			{ kind: BaseType.XSANYATOMICTYPE },
			{ kind: BaseType.ANY, item: { kind: BaseType.ITEM } },
		],
		returnType: { kind: BaseType.MAP, items: [] },
		callFunction: mapEntry,
	},

	{
		namespaceURI: MAP_NAMESPACE_URI,
		localName: 'for-each',
		// TODO: reimplement type checking by parsing the types
		// argumentTypes: [{ kind: BaseType.MAP, items: [] }, '({ kind: BaseType.XSANYATOMICTYPE ,
		// { kind: BaseType.ANY, item: { kind: BaseType.ITEM } }) as { kind: BaseType.ANY, item: { kind: BaseType.ITEM } }'],
		argumentTypes: [
			{ kind: BaseType.MAP, items: [] },
			{ kind: BaseType.ANY, item: { kind: BaseType.ITEM } },
		],
		returnType: { kind: BaseType.ANY, item: { kind: BaseType.ITEM } },
		callFunction: mapForEach,
	},

	{
		namespaceURI: MAP_NAMESPACE_URI,
		localName: 'get',
		argumentTypes: [{ kind: BaseType.MAP, items: [] }, { kind: BaseType.XSANYATOMICTYPE }],
		returnType: { kind: BaseType.ANY, item: { kind: BaseType.ITEM } },
		callFunction: mapGet,
	},

	{
		namespaceURI: MAP_NAMESPACE_URI,
		localName: 'keys',
		argumentTypes: [{ kind: BaseType.MAP, items: [] }],
		returnType: { kind: BaseType.ANY, item: { kind: BaseType.XSANYATOMICTYPE } },
		callFunction: mapKeys,
	},

	{
		namespaceURI: MAP_NAMESPACE_URI,
		localName: 'merge',
		argumentTypes: [
			{ kind: BaseType.ANY, item: { kind: BaseType.MAP, items: [] } },
			{ kind: BaseType.MAP, items: [] },
		],
		returnType: { kind: BaseType.MAP, items: [] },
		callFunction: mapMerge,
	},

	{
		namespaceURI: MAP_NAMESPACE_URI,
		localName: 'merge',
		argumentTypes: [{ kind: BaseType.ANY, item: { kind: BaseType.MAP, items: [] } }],
		returnType: { kind: BaseType.MAP, items: [] },
		callFunction(dynamicContext, executionParameters, staticContext, maps) {
			return mapMerge(
				dynamicContext,
				executionParameters,
				staticContext,
				maps,
				sequenceFactory.singleton(
					new MapValue([
						{
							key: createAtomicValue('duplicates', { kind: BaseType.XSSTRING }),
							value: () =>
								sequenceFactory.singleton(
									createAtomicValue('use-first', { kind: BaseType.XSSTRING })
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
		argumentTypes: [
			{ kind: BaseType.MAP, items: [] },
			{ kind: BaseType.XSANYATOMICTYPE },
			{ kind: BaseType.ANY, item: { kind: BaseType.ITEM } },
		],
		returnType: { kind: BaseType.MAP, items: [] },
		callFunction: mapPut,
	},

	{
		namespaceURI: MAP_NAMESPACE_URI,
		localName: 'remove',
		argumentTypes: [
			{ kind: BaseType.MAP, items: [] },
			{ kind: BaseType.ANY, item: { kind: BaseType.XSANYATOMICTYPE } },
		],
		returnType: { kind: BaseType.MAP, items: [] },
		callFunction: mapRemove,
	},

	{
		namespaceURI: MAP_NAMESPACE_URI,
		localName: 'size',
		argumentTypes: [{ kind: BaseType.MAP, items: [] }],
		returnType: { kind: BaseType.XSINTEGER },
		callFunction: mapSize,
	},
];

export default {
	declarations,
	functions: {
		get: mapGet,
		merge: mapMerge,
		put: mapPut,
		size: mapSize,
	},
};
