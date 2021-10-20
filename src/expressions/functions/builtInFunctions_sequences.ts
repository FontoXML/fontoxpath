import atomize from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, { SequenceMultiplicity, SequenceType, ValueType } from '../dataTypes/Value';
import { valueCompare } from '../operators/compares/ValueCompare';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import { DONE_TOKEN, IIterator, IterationHint, ready } from '../util/iterators';
import zipSingleton from '../util/zipSingleton';
import { performFunctionConversion } from './argumentHelper';
import { BuiltinDeclarationType } from './builtInFunctions';
import sequenceDeepEqual from './builtInFunctions_sequences_deepEqual';
import convertItemsToCommonType from './convertItemsToCommonType';
import FunctionDefinitionType from './FunctionDefinitionType';

function subSequence(sequence: ISequence, start: number, length: number) {
	// XPath starts from 1
	let i = 1;
	const iterator = sequence.value;

	const predictedLength = sequence.getLength(true);
	let newSequenceLength = null;
	const startIndex = Math.max(start - 1, 0);
	if (predictedLength !== -1) {
		const endIndex =
			length === null
				? predictedLength
				: Math.max(0, Math.min(predictedLength, length + (start - 1)));
		newSequenceLength = Math.max(0, endIndex - startIndex);
	}
	return sequenceFactory.create(
		{
			next: (hint: IterationHint) => {
				while (i < start) {
					iterator.next(hint);
					i++;
				}
				if (length !== null && i >= start + length) {
					return DONE_TOKEN;
				}

				const returnableVal = iterator.next(hint);
				i++;

				return returnableVal;
			},
		},
		newSequenceLength
	);
}

function castUntypedItemsToDouble(items: Value[]) {
	return items.map((item) => {
		if (isSubtypeOf(item.type, ValueType.XSUNTYPEDATOMIC)) {
			return castToType(item, ValueType.XSDOUBLE);
		}
		return item;
	});
}

function castItemsForMinMax(items: Value[]) {
	// Values of type xs:untypedAtomic in $arg are cast to xs:double.
	items = castUntypedItemsToDouble(items);

	if (
		items.some((item) => {
			return Number.isNaN(item.value);
		})
	) {
		return [createAtomicValue(NaN, ValueType.XSDOUBLE)];
	}

	const convertResult = convertItemsToCommonType(items);

	if (!convertResult) {
		throw new Error('FORG0006: Incompatible types to be converted to a common type');
	}

	return convertResult;
}

const fnEmpty: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.switchCases({
		empty: () => sequenceFactory.singletonTrueSequence(),
		multiple: () => sequenceFactory.singletonFalseSequence(),
		singleton: () => sequenceFactory.singletonFalseSequence(),
	});
};

const fnExists: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.switchCases({
		empty: () => sequenceFactory.singletonFalseSequence(),
		multiple: () => sequenceFactory.singletonTrueSequence(),
		singleton: () => sequenceFactory.singletonTrueSequence(),
	});
};

const fnHead: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return subSequence(sequence, 1, 1);
};

const fnTail: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return subSequence(sequence, 2, null);
};

const fnInsertBefore: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
	position,
	inserts
) => {
	if (sequence.isEmpty()) {
		return inserts;
	}

	if (inserts.isEmpty()) {
		return sequence;
	}
	const sequenceValue = sequence.getAllValues();

	// XPath is 1 based
	let effectivePosition = position.first().value - 1;
	if (effectivePosition < 0) {
		effectivePosition = 0;
	} else if (effectivePosition > sequenceValue.length) {
		effectivePosition = sequenceValue.length;
	}

	const firstHalve = sequenceValue.slice(0, effectivePosition);
	const secondHalve = sequenceValue.slice(effectivePosition);

	return sequenceFactory.create(firstHalve.concat(inserts.getAllValues(), secondHalve));
};

const fnRemove: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
	position
) => {
	const effectivePosition = position.first().value;
	const sequenceValue = sequence.getAllValues();
	if (
		!sequenceValue.length ||
		effectivePosition < 1 ||
		effectivePosition > sequenceValue.length
	) {
		return sequenceFactory.create(sequenceValue);
	}
	sequenceValue.splice(effectivePosition - 1, 1);
	return sequenceFactory.create(sequenceValue);
};

const fnReverse: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.mapAll((allValues) => sequenceFactory.create(allValues.reverse()));
};

const fnSubsequence: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
	startSequence,
	lengthSequence
) => {
	return zipSingleton([startSequence, lengthSequence], ([startVal, lengthVal]) => {
		if (startVal.value === Infinity) {
			return sequenceFactory.empty();
		}
		if (startVal.value === -Infinity) {
			if (lengthVal && lengthVal.value === Infinity) {
				return sequenceFactory.empty();
			}
			return sequence;
		}
		if (lengthVal) {
			if (isNaN(lengthVal.value)) {
				return sequenceFactory.empty();
			}
			if (lengthVal.value === Infinity) {
				lengthVal = null;
			}
		}
		if (isNaN(startVal.value)) {
			return sequenceFactory.empty();
		}
		return subSequence(
			sequence,
			Math.round(startVal.value),
			lengthVal ? Math.round(lengthVal.value) : null
		);
	});
};

const fnUnordered: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence;
};

const fnIndexOf: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	_staticContext,
	sequence,
	search
) => {
	return search.mapAll(([onlySearchValue]) =>
		atomize(sequence, executionParameters)
			.map((element, i) => {
				const compareFunction = valueCompare('eqOp', element.type, onlySearchValue.type);
				return compareFunction(element, onlySearchValue, dynamicContext)
					? createAtomicValue(i + 1, ValueType.XSINTEGER)
					: createAtomicValue(-1, ValueType.XSINTEGER);
			})
			.filter((indexValue) => {
				return indexValue.value !== -1;
			})
	);
};

const fnDeepEqual: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	parameter1,
	parameter2
) => {
	let hasPassed = false;
	const deepEqualityIterator = sequenceDeepEqual(
		dynamicContext,
		executionParameters,
		staticContext,
		parameter1,
		parameter2
	);

	return sequenceFactory.create({
		next: (_hint: IterationHint) => {
			if (hasPassed) {
				return DONE_TOKEN;
			}
			const result = deepEqualityIterator.next(IterationHint.NONE);
			if (result.done) {
				return result;
			}
			hasPassed = true;
			return ready(createAtomicValue(result.value, ValueType.XSBOOLEAN));
		},
	});
};

const fnCount: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	let hasPassed = false;
	return sequenceFactory.create({
		next: () => {
			if (hasPassed) {
				return DONE_TOKEN;
			}
			const length = sequence.getLength();
			hasPassed = true;
			return ready(createAtomicValue(length, ValueType.XSINTEGER));
		},
	});
};

const fnAvg: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}

	// TODO: throw FORG0006 if the items contain both yearMonthDurations and dayTimeDurations
	let items = castUntypedItemsToDouble(sequence.getAllValues());
	items = convertItemsToCommonType(items);
	if (!items) {
		throw new Error('FORG0006: Incompatible types to be converted to a common type');
	}

	if (!items.every((item) => isSubtypeOf(item.type, ValueType.XSNUMERIC))) {
		throw new Error('FORG0006: items passed to fn:avg are not all numeric.');
	}

	const resultValue =
		items.reduce((sum, item) => {
			return sum + item.value;
		}, 0) / items.length;

	if (
		items.every((item) => {
			return (
				isSubtypeOf(item.type, ValueType.XSINTEGER) ||
				isSubtypeOf(item.type, ValueType.XSDOUBLE)
			);
		})
	) {
		return sequenceFactory.singleton(createAtomicValue(resultValue, ValueType.XSDOUBLE));
	}

	if (
		items.every((item) => {
			return isSubtypeOf(item.type, ValueType.XSDECIMAL);
		})
	) {
		return sequenceFactory.singleton(createAtomicValue(resultValue, ValueType.XSDECIMAL));
	}

	return sequenceFactory.singleton(createAtomicValue(resultValue, ValueType.XSFLOAT));
};

const fnMax: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const items = castItemsForMinMax(sequence.getAllValues());

	// Use first element in array as initial value
	return sequenceFactory.singleton(
		items.reduce((max, item) => {
			return max.value < item.value ? item : max;
		})
	);
};

const fnMin: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const items = castItemsForMinMax(sequence.getAllValues());

	// Use first element in array as initial value
	return sequenceFactory.singleton(
		items.reduce((min, item) => {
			return min.value > item.value ? item : min;
		})
	);
};

const fnSum: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
	zero
) => {
	// TODO: throw FORG0006 if the items contain both yearMonthDurations and dayTimeDurations
	if (sequence.isEmpty()) {
		return zero;
	}

	let items = castUntypedItemsToDouble(sequence.getAllValues());
	items = convertItemsToCommonType(items);
	if (!items) {
		throw new Error('FORG0006: Incompatible types to be converted to a common type');
	}

	if (!items.every((item) => isSubtypeOf(item.type, ValueType.XSNUMERIC))) {
		throw new Error('FORG0006: items passed to fn:sum are not all numeric.');
	}

	const resultValue = items.reduce((sum, item) => {
		return sum + item.value;
	}, 0);

	if (
		items.every((item) => {
			return isSubtypeOf(item.type, ValueType.XSINTEGER);
		})
	) {
		return sequenceFactory.singleton(createAtomicValue(resultValue, ValueType.XSINTEGER));
	}

	if (
		items.every((item) => {
			return isSubtypeOf(item.type, ValueType.XSDOUBLE);
		})
	) {
		return sequenceFactory.singleton(createAtomicValue(resultValue, ValueType.XSDOUBLE));
	}

	if (
		items.every((item) => {
			return isSubtypeOf(item.type, ValueType.XSDECIMAL);
		})
	) {
		return sequenceFactory.singleton(createAtomicValue(resultValue, ValueType.XSDECIMAL));
	}

	return sequenceFactory.singleton(createAtomicValue(resultValue, ValueType.XSFLOAT));
};

const fnZeroOrOne: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg
) => {
	if (!arg.isEmpty() && !arg.isSingleton()) {
		throw new Error(
			'FORG0003: The argument passed to fn:zero-or-one contained more than one item.'
		);
	}
	return arg;
};

const fnOneOrMore: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg
) => {
	if (arg.isEmpty()) {
		throw new Error('FORG0004: The argument passed to fn:one-or-more was empty.');
	}
	return arg;
};

const fnExactlyOne: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg
) => {
	if (!arg.isSingleton()) {
		throw new Error(
			'FORG0005: The argument passed to fn:exactly-one is empty or contained more than one item.'
		);
	}
	return arg;
};

const fnFilter: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	sequence,
	callbackSequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const callbackFn = callbackSequence.first() as FunctionValue;
	const callbackArgumentTypes = callbackFn.getArgumentTypes();
	if (callbackArgumentTypes.length !== 1) {
		throw new Error(`XPTY0004: signature of function passed to fn:filter is incompatible.`);
	}

	return sequence.filter((item) => {
		// Transform argument
		const transformedArgument = performFunctionConversion(
			callbackArgumentTypes[0] as SequenceType,
			sequenceFactory.singleton(item),
			executionParameters,
			'fn:filter',
			false
		);
		const functionCallResult = callbackFn.value.call(
			undefined,
			dynamicContext,
			executionParameters,
			staticContext,
			transformedArgument
		);
		if (
			!functionCallResult.isSingleton() ||
			!isSubtypeOf(functionCallResult.first().type, ValueType.XSBOOLEAN)
		) {
			throw new Error(`XPTY0004: signature of function passed to fn:filter is incompatible.`);
		}
		return functionCallResult.first().value;
	});
};

const fnForEach: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	sequence,
	callbackSequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const callbackFn = callbackSequence.first() as FunctionValue;
	const callbackArgumentTypes = callbackFn.getArgumentTypes();
	if (callbackArgumentTypes.length !== 1) {
		throw new Error(`XPTY0004: signature of function passed to fn:for-each is incompatible.`);
	}

	const outerIterator = sequence.value;
	let innerIterator: IIterator<Value>;
	return sequenceFactory.create({
		next: (hint: IterationHint) => {
			while (true) {
				if (!innerIterator) {
					const item = outerIterator.next(IterationHint.NONE);

					if (item.done) {
						return item;
					}

					const transformedArgument = performFunctionConversion(
						callbackArgumentTypes[0] as SequenceType,
						sequenceFactory.singleton(item.value),
						executionParameters,
						'fn:for-each',
						false
					);
					const nextSequence = callbackFn.value.call(
						undefined,
						dynamicContext,
						executionParameters,
						staticContext,
						transformedArgument
					);

					innerIterator = nextSequence.value;
				}

				const entry = innerIterator.next(hint);
				if (!entry.done) {
					return entry;
				}
				innerIterator = null;
			}
		},
	});
};

const fnFoldLeft: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	sequence,
	zero,
	callbackSequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const callbackFn = callbackSequence.first() as FunctionValue;
	const callbackArgumentTypes = callbackFn.getArgumentTypes();
	if (callbackArgumentTypes.length !== 2) {
		throw new Error(`XPTY0004: signature of function passed to fn:fold-left is incompatible.`);
	}

	return sequence.mapAll((values) =>
		values.reduce((previous, current) => {
			const previousArg = performFunctionConversion(
				callbackArgumentTypes[0] as SequenceType,
				previous,
				executionParameters,
				'fn:fold-left',
				false
			);
			const currentArg = performFunctionConversion(
				callbackArgumentTypes[1] as SequenceType,
				sequenceFactory.singleton(current),
				executionParameters,
				'fn:fold-left',
				false
			);
			return callbackFn.value.call(
				undefined,
				dynamicContext,
				executionParameters,
				staticContext,
				previousArg,
				currentArg
			);
		}, zero)
	);
};

const fnFoldRight: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	sequence,
	zero,
	callbackSequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const callbackFn = callbackSequence.first() as FunctionValue;
	const callbackArgumentTypes = callbackFn.getArgumentTypes();
	if (callbackArgumentTypes.length !== 2) {
		throw new Error(`XPTY0004: signature of function passed to fn:fold-right is incompatible.`);
	}

	return sequence.mapAll((values) =>
		values.reduceRight((previous, current) => {
			const previousArg = performFunctionConversion(
				callbackArgumentTypes[0] as SequenceType,
				previous,
				executionParameters,
				'fn:fold-right',
				false
			);
			const currentArg = performFunctionConversion(
				callbackArgumentTypes[1] as SequenceType,
				sequenceFactory.singleton(current),
				executionParameters,
				'fn:fold-right',
				false
			);
			return callbackFn.value.call(
				undefined,
				dynamicContext,
				executionParameters,
				staticContext,
				currentArg,
				previousArg
			);
		}, zero)
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnEmpty,
		localName: 'empty',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnExists,
		localName: 'exists',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnHead,
		localName: 'head',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnTail,
		localName: 'tail',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
		],
		callFunction: fnInsertBefore,
		localName: 'insert-before',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction: fnRemove,
		localName: 'remove',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnReverse,
		localName: 'reverse',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction: ((dynamicContext, executionParameters, _staticContext, sequence, start) =>
			fnSubsequence(
				dynamicContext,
				executionParameters,
				_staticContext,
				sequence,
				start,
				sequenceFactory.empty()
			)) as FunctionDefinitionType,
		localName: 'subsequence',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction: fnSubsequence,
		localName: 'subsequence',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnUnordered,
		localName: 'unordered',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction: fnIndexOf,
		localName: 'index-of',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction() {
			throw new Error('FOCH0002: No collations are supported');
		},
		localName: 'index-of',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
		],
		callFunction: fnDeepEqual,
		localName: 'deep-equal',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction() {
			throw new Error('FOCH0002: No collations are supported');
		},
		localName: 'deep-equal',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnCount,
		localName: 'count',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
		],
		callFunction: fnAvg,
		localName: 'avg',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
		],
		callFunction: fnMax,
		localName: 'max',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction() {
			throw new Error('FOCH0002: No collations are supported');
		},
		localName: 'max',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
		],
		callFunction: fnMin,
		localName: 'min',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction() {
			throw new Error('FOCH0002: No collations are supported');
		},
		localName: 'min',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
		],
		callFunction: ((dynamicContext, executionParameters, _staticContext, sequence) => {
			return fnSum(
				dynamicContext,
				executionParameters,
				_staticContext,
				sequence,
				sequenceFactory.singleton(createAtomicValue(0, ValueType.XSINTEGER))
			);
		}) as FunctionDefinitionType,
		localName: 'sum',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		callFunction: fnSum,
		localName: 'sum',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnZeroOrOne,
		localName: 'zero-or-one',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnOneOrMore,
		localName: 'one-or-more',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ONE_OR_MORE },
	},

	{
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnExactlyOne,
		localName: 'exactly-one',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{
				type: ValueType.FUNCTION,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			},
		],
		callFunction: fnFilter,
		localName: 'filter',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{
				type: ValueType.FUNCTION,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			},
		],
		callFunction: fnForEach,
		localName: 'for-each',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{
				type: ValueType.FUNCTION,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			},
		],
		callFunction: fnFoldLeft,
		localName: 'fold-left',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
			{
				type: ValueType.FUNCTION,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			},
		],
		callFunction: fnFoldRight,
		localName: 'fold-right',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},
];

export default {
	declarations,
	functions: {
		avg: fnAvg,
		count: fnCount,
		max: fnMax,
		min: fnMin,
		reverse: fnReverse,
		sum: fnSum,
	},
};
