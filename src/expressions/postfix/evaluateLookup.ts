import ArrayValue from '../dataTypes/ArrayValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import MapValue from '../dataTypes/MapValue';
import EmptySequence from '../dataTypes/Sequences/EmptySequence';
import Value from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression from '../Expression';
import { errFOAY0001 } from '../functions/FunctionOperationErrors';
import isSameMapKey from '../functions/isSameMapKey';
import concatSequences from '../util/concatSequences';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import { errXPTY0004 } from '../xquery/XQueryErrors';

function performLookup(
	contextItem: Value,
	lookup: '*' | Value,
	previousSequence: ISequence
): ISequence {
	const sequences = [previousSequence];

	if (isSubtypeOf(contextItem.type, 'array(*)')) {
		const arrayItem = contextItem as ArrayValue;
		if (lookup === '*') {
			sequences.push(...arrayItem.members.map((member) => member()));
		} else if (!isSubtypeOf(lookup.type, 'xs:integer')) {
			throw errXPTY0004('The key specifier is not an integer.');
		} else {
			const index = lookup.value as number;
			if (arrayItem.members.length < index || 0 >= index) {
				throw errFOAY0001();
			}
			sequences.push(arrayItem.members[index - 1]());
		}
	} else if (isSubtypeOf(contextItem.type, 'map(*)')) {
		const mapItem = contextItem as MapValue;
		if (lookup === '*') {
			sequences.push(...mapItem.keyValuePairs.map((keyValuePair) => keyValuePair.value()));
		} else {
			const matchingPair = mapItem.keyValuePairs.find((keyValuePair) =>
				isSameMapKey(keyValuePair.key, lookup)
			);
			if (matchingPair) {
				sequences.push(matchingPair.value());
			}
		}
	} else {
		throw errXPTY0004('The provided context item is not a map or an array.');
	}
	return concatSequences(sequences);
}

export default function evaluateLookup(
	contextItem: Value,
	keySpecifier: '*' | Expression,
	initialSequence: ISequence,
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters
): ISequence {
	if (keySpecifier === '*') {
		return performLookup(contextItem, keySpecifier, initialSequence);
	}

	const lookupSequence = keySpecifier.evaluateMaybeStatically(
		dynamicContext,
		executionParameters
	);
	const createLookupSequence = createDoublyIterableSequence(lookupSequence);

	const deepSequence = createLookupSequence().mapAll((lookups) =>
		lookups.reduce((sequenceToReturn, lookup) => {
			return performLookup(contextItem, lookup, sequenceToReturn);
		}, new EmptySequence())
	);
	return concatSequences([initialSequence, deepSequence]);
}
