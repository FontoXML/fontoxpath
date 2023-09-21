import createAtomicValue from '../dataTypes/createAtomicValue';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import concatSequences from '../util/concatSequences';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import zipSingleton from '../util/zipSingleton';
import { BuiltinDeclarationType } from './builtInFunctions';
import mapGet from './builtInFunctions_maps_get';
import FunctionDefinitionType from './FunctionDefinitionType';
import isSameMapKey from './isSameMapKey';

const mapMerge: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	mapSequence,
	optionMap,
) => {
	const duplicateKey = sequenceFactory.singleton(
		createAtomicValue('duplicates', ValueType.XSSTRING),
	);
	const duplicationHandlingValueSequence = mapGet(
		dynamicContext,
		executionParameters,
		staticContext,
		optionMap,
		duplicateKey,
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
							isSameMapKey(existingPair.key, keyValuePair.key),
						);

						if (existingPairIndex >= 0) {
							// Duplicate keys, use options to determine what to do
							switch (duplicationHandlingStrategy) {
								case 'reject':
									throw new Error(
										'FOJS0003: Duplicate encountered when merging maps.',
									);
								case 'use-last':
									// Use this one
									resultingKeyValuePairs.splice(
										existingPairIndex,
										1,
										keyValuePair,
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
													.concat(keyValuePair.value().getAllValues()),
											),
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
				}, []),
			),
		),
	);
};

const mapPut: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence,
	keySequence,
	newValueSequence,
) => {
	return zipSingleton([mapSequence, keySequence], ([map, newKey]) => {
		const resultingKeyValuePairs = (map as MapValue).keyValuePairs.concat();
		const indexOfExistingPair = resultingKeyValuePairs.findIndex((existingPair) =>
			isSameMapKey(existingPair.key, newKey),
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
	value,
) => {
	return keySequence.map(
		(onlyKey) => new MapValue([{ key: onlyKey, value: createDoublyIterableSequence(value) }]),
	);
};

const mapSize: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence,
) => {
	return mapSequence.map((onlyMap) =>
		createAtomicValue((onlyMap as MapValue).keyValuePairs.length, ValueType.XSINTEGER),
	);
};

const mapKeys: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence,
) => {
	return zipSingleton([mapSequence], ([map]) =>
		sequenceFactory.create((map as MapValue).keyValuePairs.map((pair) => pair.key)),
	);
};

const mapContains: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	mapSequence,
	keySequence,
) => {
	return zipSingleton([mapSequence, keySequence], ([map, key]) => {
		const doesContain = (map as MapValue).keyValuePairs.some((pair) =>
			isSameMapKey(pair.key, key),
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
	keySequence,
) => {
	return zipSingleton([mapSequence], ([map]) => {
		const resultingKeyValuePairs = (map as MapValue).keyValuePairs.concat();
		return keySequence.mapAll((keys) => {
			keys.forEach((key) => {
				const indexOfExistingPair = resultingKeyValuePairs.findIndex((existingPair) =>
					isSameMapKey(existingPair.key, key),
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
	itemSequence,
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
					keyValuePair.value(),
				),
			),
		),
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MAP_NAMESPACE_URI,
		localName: 'contains',
		argumentTypes: [
			{ type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: mapContains,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MAP_NAMESPACE_URI,
		localName: 'entry',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
		],
		returnType: { type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: mapEntry,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MAP_NAMESPACE_URI,
		localName: 'for-each',
		// TODO: reimplement type checking by parsing the types
		argumentTypes: [
			{ type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
		],
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
		callFunction: mapForEach,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MAP_NAMESPACE_URI,
		localName: 'get',
		argumentTypes: [
			{ type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
		callFunction: mapGet,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MAP_NAMESPACE_URI,
		localName: 'keys',
		argumentTypes: [{ type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE }],
		returnType: { type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
		callFunction: mapKeys,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MAP_NAMESPACE_URI,
		localName: 'merge',
		argumentTypes: [
			{ type: ValueType.MAP, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: mapMerge,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MAP_NAMESPACE_URI,
		localName: 'merge',
		argumentTypes: [{ type: ValueType.MAP, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		returnType: { type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction(dynamicContext, executionParameters, staticContext, maps) {
			return mapMerge(
				dynamicContext,
				executionParameters,
				staticContext,
				maps,
				sequenceFactory.singleton(
					new MapValue([
						{
							key: createAtomicValue('duplicates', ValueType.XSSTRING),
							value: () =>
								sequenceFactory.singleton(
									createAtomicValue('use-first', ValueType.XSSTRING),
								),
						},
					]),
				),
			);
		},
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MAP_NAMESPACE_URI,
		localName: 'put',
		argumentTypes: [
			{ type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
		],
		returnType: { type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: mapPut,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MAP_NAMESPACE_URI,
		localName: 'remove',
		argumentTypes: [
			{ type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
		],
		returnType: { type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: mapRemove,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.MAP_NAMESPACE_URI,
		localName: 'size',
		argumentTypes: [{ type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE }],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
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
