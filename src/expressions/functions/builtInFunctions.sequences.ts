import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import TypeDeclaration from '../dataTypes/TypeDeclaration';
import { getPrimitiveTypeName } from '../dataTypes/typeHelpers';
import Value from '../dataTypes/Value';
import valueCompare from '../operators/compares/valueCompare';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import { DONE_TOKEN, IAsyncIterator, IterationHint, notReady, ready } from '../util/iterators';
import zipSingleton from '../util/zipSingleton';
import { performFunctionConversion } from './argumentHelper';
import sequenceDeepEqual from './builtInFunctions.sequences.deepEqual';
import FunctionDefinitionType from './FunctionDefinitionType';

function subSequence(sequence: ISequence, start: number, length: number) {
	// XPath starts from 1
	let i = 1;
	const iterator = sequence.value;

	const predictedLength = sequence.tryGetLength(true);
	let newSequenceLength = null;
	const startIndex = Math.max(start - 1, 0);
	if (predictedLength.ready && predictedLength.value !== -1) {
		const endIndex =
			length === null
				? predictedLength.value
				: Math.max(0, Math.min(predictedLength.value, length + (start - 1)));
		newSequenceLength = Math.max(0, endIndex - startIndex);
	}
	return sequenceFactory.create(
		{
			next: (hint: IterationHint) => {
				while (i < start) {
					const val = iterator.next(hint);
					if (!val.ready) {
						return val;
					}
					i++;
				}
				if (length !== null && i >= start + length) {
					return DONE_TOKEN;
				}

				const val = iterator.next(hint);
				if (!val.ready) {
					return val;
				}
				i++;

				return val;
			}
		},
		newSequenceLength
	);
}

/**
 * Promote all given (numeric) items to single common type
 * https://www.w3.org/TR/xpath-31/#promotion
 */
function convertItemsToCommonType(items) {
	if (
		items.every(function(item) {
			// xs:integer is the only numeric type with inherits from another numeric type
			return isSubtypeOf(item.type, 'xs:integer') || isSubtypeOf(item.type, 'xs:decimal');
		})
	) {
		// They are all integers, we do not have to convert them to decimals
		return items;
	}
	const commonTypeName = items
		.map((item: { type: string }) => getPrimitiveTypeName(item.type))
		.reduce((commonTypeName, itemType) => {
			return itemType === commonTypeName ? commonTypeName : null;
		});

	if (commonTypeName !== null) {
		// All items are already of the same type
		return items;
	}

	// If each value is an instance of one of the types xs:string or xs:anyURI, then all the values are cast to type xs:string
	if (
		items.every(function(item) {
			return isSubtypeOf(item.type, 'xs:string') || isSubtypeOf(item.type, 'xs:anyURI');
		})
	) {
		return items.map(item => castToType(item, 'xs:string'));
	}

	// If each value is an instance of one of the types xs:decimal or xs:float, then all the values are cast to type xs:float.
	if (
		items.every(function(item) {
			return isSubtypeOf(item.type, 'xs:decimal') || isSubtypeOf(item.type, 'xs:float');
		})
	) {
		return items.map(item => castToType(item, 'xs:float'));
	}
	// If each value is an instance of one of the types xs:decimal, xs:float, or xs:double, then all the values are cast to type xs:double.
	if (
		items.every(function(item) {
			return (
				isSubtypeOf(item.type, 'xs:decimal') ||
				isSubtypeOf(item.type, 'xs:float') ||
				isSubtypeOf(item.type, 'xs:double')
			);
		})
	) {
		return items.map(item => castToType(item, 'xs:double'));
	}

	// Otherwise, a type error is raised [err:FORG0006].
	throw new Error('FORG0006: Incompatible types to be converted to a common type');
}

function castUntypedItemsToDouble(items) {
	return items.map(function(item) {
		if (isSubtypeOf(item.type, 'xs:untypedAtomic')) {
			return castToType(item, 'xs:double');
		}
		return item;
	});
}

function castItemsForMinMax(items) {
	// Values of type xs:untypedAtomic in $arg are cast to xs:double.
	items = castUntypedItemsToDouble(items);

	if (
		items.some(function(item) {
			return Number.isNaN(item.value);
		})
	) {
		return [createAtomicValue(NaN, 'xs:double')];
	}

	return convertItemsToCommonType(items);
}

const fnEmpty: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	return sequence.switchCases({
		empty: () => sequenceFactory.singletonTrueSequence(),
		singleton: () => sequenceFactory.singletonFalseSequence(),
		multiple: () => sequenceFactory.singletonFalseSequence()
	});
};

const fnExists: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	return sequence.switchCases({
		empty: () => sequenceFactory.singletonFalseSequence(),
		singleton: () => sequenceFactory.singletonTrueSequence(),
		multiple: () => sequenceFactory.singletonTrueSequence()
	});
};

const fnHead: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	return subSequence(sequence, 1, 1);
};

const fnTail: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	return subSequence(sequence, 2, null);
};

const fnInsertBefore: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
	position,
	inserts
) {
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

const fnRemove: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
	position
) {
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

const fnReverse: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	return sequence.mapAll(allValues => sequenceFactory.create(allValues.reverse()));
};

const fnSubsequence: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
	startSequence,
	lengthSequence
) {
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
	_executionParameters,
	_staticContext,
	sequence,
	search
) => {
	// This should work
	// I've a question, can we enable the index-of tests on the runnableTestSets file? yeah!

	return search.mapAll(([onlySearchValue]) => sequence.map((element, i) => {
		return valueCompare('eqOp', element, onlySearchValue, dynamicContext) ? createAtomicValue(i + 1, 'xs:integer') : createAtomicValue(-1, 'xs:integer');
	}).filter((indexValue) => {
		return indexValue.value !== -1;
	}));
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
			if (!result.ready || result.done) {
				return result;
			}
			hasPassed = true;
			return ready(createAtomicValue(result.value, 'xs:boolean'));
		}
	});
};

const fnCount: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	let hasPassed = false;
	return sequenceFactory.create({
		next: () => {
			if (hasPassed) {
				return DONE_TOKEN;
			}
			const length = sequence.tryGetLength(false);
			if (!length.ready) {
				return notReady(length.promise);
			}
			hasPassed = true;
			return ready(createAtomicValue(length.value, 'xs:integer'));
		}
	});
};

const fnAvg: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	// TODO: throw FORG0006 if the items contain both yearMonthDurations and dayTimeDurations
	let items = castUntypedItemsToDouble(sequence.getAllValues());
	items = convertItemsToCommonType(items);
	if (!items.every(item => isSubtypeOf(item.type, 'xs:numeric'))) {
		throw new Error('FORG0006: items passed to fn:avg are not all numeric.');
	}

	const resultValue =
		items.reduce(function(sum, item) {
			return sum + item.value;
		}, 0) / items.length;

	if (
		items.every(function(item) {
			return isSubtypeOf(item.type, 'xs:integer') || isSubtypeOf(item.type, 'xs:double');
		})
	) {
		return sequenceFactory.singleton(createAtomicValue(resultValue, 'xs:double'));
	}

	if (
		items.every(function(item) {
			return isSubtypeOf(item.type, 'xs:decimal');
		})
	) {
		return sequenceFactory.singleton(createAtomicValue(resultValue, 'xs:decimal'));
	}

	return sequenceFactory.singleton(createAtomicValue(resultValue, 'xs:float'));
};

const fnMax: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const items = castItemsForMinMax(sequence.getAllValues());

	// Use first element in array as initial value
	return sequenceFactory.singleton(
		items.reduce(function(max, item) {
			return max.value < item.value ? item : max;
		})
	);
};

const fnMin: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const items = castItemsForMinMax(sequence.getAllValues());

	// Use first element in array as initial value
	return sequenceFactory.singleton(
		items.reduce(function(min, item) {
			return min.value > item.value ? item : min;
		})
	);
};

const fnSum: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence,
	zero
) {
	// TODO: throw FORG0006 if the items contain both yearMonthDurations and dayTimeDurations
	if (sequence.isEmpty()) {
		return zero;
	}

	let items = castUntypedItemsToDouble(sequence.getAllValues());
	items = convertItemsToCommonType(items);
	if (!items.every(item => isSubtypeOf(item.type, 'xs:numeric'))) {
		throw new Error('FORG0006: items passed to fn:sum are not all numeric.');
	}

	const resultValue = items.reduce(function(sum, item) {
		return sum + item.value;
	}, 0);

	if (
		items.every(function(item) {
			return isSubtypeOf(item.type, 'xs:integer');
		})
	) {
		return sequenceFactory.singleton(createAtomicValue(resultValue, 'xs:integer'));
	}

	if (
		items.every(function(item) {
			return isSubtypeOf(item.type, 'xs:double');
		})
	) {
		return sequenceFactory.singleton(createAtomicValue(resultValue, 'xs:double'));
	}

	if (
		items.every(function(item) {
			return isSubtypeOf(item.type, 'xs:decimal');
		})
	) {
		return sequenceFactory.singleton(createAtomicValue(resultValue, 'xs:decimal'));
	}

	return sequenceFactory.singleton(createAtomicValue(resultValue, 'xs:float'));
};

const fnZeroOrOne: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg
) {
	if (!arg.isEmpty() && !arg.isSingleton()) {
		throw new Error(
			'FORG0003: The argument passed to fn:zero-or-one contained more than one item.'
		);
	}
	return arg;
};

const fnOneOrMore: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg
) {
	if (arg.isEmpty()) {
		throw new Error('FORG0004: The argument passed to fn:one-or-more was empty.');
	}
	return arg;
};

const fnExactlyOne: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg
) {
	if (!arg.isSingleton()) {
		throw new Error(
			'FORG0005: The argument passed to fn:zero-or-one is empty or contained more then one item.'
		);
	}
	return arg;
};

const fnFilter: FunctionDefinitionType = function(
	dynamicContext,
	executionParameters,
	staticContext,
	sequence,
	callbackSequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const callbackFn = callbackSequence.first() as FunctionValue;
	const callbackArgumentTypes = callbackFn.getArgumentTypes();
	if (callbackArgumentTypes.length !== 1) {
		throw new Error(`XPTY0004: signature of function passed to fn:filter is incompatible.`);
	}

	return sequence.filter(item => {
		// Transform argument
		const transformedArgument = performFunctionConversion(
			callbackArgumentTypes[0] as TypeDeclaration,
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
			!isSubtypeOf(functionCallResult.first().type, 'xs:boolean')
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
	let innerIterator: IAsyncIterator<Value>;
	return sequenceFactory.create({
		next: (hint: IterationHint) => {
			while (true) {
				if (!innerIterator) {
					const item = outerIterator.next(IterationHint.NONE);

					if (!item.ready || item.done) {
						return item;
					}

					const transformedArgument = performFunctionConversion(
						callbackArgumentTypes[0] as TypeDeclaration,
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
		}
	});
};

const fnFoldLeft: FunctionDefinitionType = function(
	dynamicContext,
	executionParameters,
	staticContext,
	sequence,
	zero,
	callbackSequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const callbackFn = callbackSequence.first() as FunctionValue;
	const callbackArgumentTypes = callbackFn.getArgumentTypes();
	if (callbackArgumentTypes.length !== 2) {
		throw new Error(`XPTY0004: signature of function passed to fn:fold-left is incompatible.`);
	}

	return sequence.mapAll(values =>
		values.reduce((previous, current) => {
			const previousArg = performFunctionConversion(
				callbackArgumentTypes[0] as TypeDeclaration,
				previous,
				executionParameters,
				'fn:fold-left',
				false
			);
			const currentArg = performFunctionConversion(
				callbackArgumentTypes[1] as TypeDeclaration,
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

const fnFoldRight: FunctionDefinitionType = function(
	dynamicContext,
	executionParameters,
	staticContext,
	sequence,
	zero,
	callbackSequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const callbackFn = callbackSequence.first() as FunctionValue;
	const callbackArgumentTypes = callbackFn.getArgumentTypes();
	if (callbackArgumentTypes.length !== 2) {
		throw new Error(`XPTY0004: signature of function passed to fn:fold-right is incompatible.`);
	}

	return sequence.mapAll(values =>
		values.reduceRight((previous, current) => {
			const previousArg = performFunctionConversion(
				callbackArgumentTypes[0] as TypeDeclaration,
				previous,
				executionParameters,
				'fn:fold-right',
				false
			);
			const currentArg = performFunctionConversion(
				callbackArgumentTypes[1] as TypeDeclaration,
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

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'empty',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnEmpty
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'exists',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnExists
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'head',
			argumentTypes: ['item()*'],
			returnType: 'item()?',
			callFunction: fnHead
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'tail',
			argumentTypes: ['item()*'],
			returnType: 'item()*',
			callFunction: fnTail
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'insert-before',
			argumentTypes: ['item()*', 'xs:integer', 'item()*'],
			returnType: 'item()*',
			callFunction: fnInsertBefore
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'remove',
			argumentTypes: ['item()*', 'xs:integer'],
			returnType: 'item()*',
			callFunction: fnRemove
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'reverse',
			argumentTypes: ['item()*'],
			returnType: 'item()*',
			callFunction: fnReverse
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'subsequence',
			argumentTypes: ['item()*', 'xs:double'],
			returnType: 'item()*',
			callFunction: (dynamicContext, executionParameters, _staticContext, sequence, start) =>
				fnSubsequence(
					dynamicContext,
					executionParameters,
					_staticContext,
					sequence,
					start,
					sequenceFactory.empty()
				)
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'subsequence',
			argumentTypes: ['item()*', 'xs:double', 'xs:double'],
			returnType: 'item()*',
			callFunction: fnSubsequence
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'unordered',
			argumentTypes: ['item()*'],
			returnType: 'item()*',
			callFunction: fnUnordered
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'index-of',
			argumentTypes: ['xs:anyAtomicType*', 'xs:anyAtomicType'],
			returnType: 'xs:integer*',
			callFunction: fnIndexOf
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'index-of',
			argumentTypes: ['xs:anyAtomicType*', 'xs:anyAtomicType', 'xs:string'],
			returnType: 'xs:integer*',
			callFunction() {
				throw new Error('FOCH0002: No collations are supported');
			}
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'deep-equal',
			argumentTypes: ['item()*', 'item()*'],
			returnType: 'xs:boolean',
			callFunction: fnDeepEqual
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'deep-equal',
			argumentTypes: ['item()*', 'item()*', 'xs:string'],
			returnType: 'xs:boolean',
			callFunction() {
				throw new Error('FOCH0002: No collations are supported');
			}
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'count',
			argumentTypes: ['item()*'],
			returnType: 'xs:integer',
			callFunction: fnCount
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'avg',
			argumentTypes: ['xs:anyAtomicType*'],
			returnType: 'xs:anyAtomicType?',
			callFunction: fnAvg
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'max',
			argumentTypes: ['xs:anyAtomicType*'],
			returnType: 'xs:anyAtomicType?',
			callFunction: fnMax
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'max',
			argumentTypes: ['xs:anyAtomicType*', 'xs:string'],
			returnType: 'xs:anyAtomicType?',
			callFunction() {
				throw new Error('FOCH0002: No collations are supported');
			}
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'min',
			argumentTypes: ['xs:anyAtomicType*'],
			returnType: 'xs:anyAtomicType?',
			callFunction: fnMin
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'min',
			argumentTypes: ['xs:anyAtomicType*', 'xs:string'],
			returnType: 'xs:anyAtomicType?',
			callFunction() {
				throw new Error('FOCH0002: No collations are supported');
			}
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'sum',
			argumentTypes: ['xs:anyAtomicType*'],
			returnType: 'xs:anyAtomicType',
			callFunction(dynamicContext, executionParameters, _staticContext, sequence) {
				return fnSum(
					dynamicContext,
					executionParameters,
					_staticContext,
					sequence,
					sequenceFactory.singleton(createAtomicValue(0, 'xs:integer'))
				);
			}
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'sum',
			argumentTypes: ['xs:anyAtomicType*', 'xs:anyAtomicType?'],
			returnType: 'xs:anyAtomicType?',
			callFunction: fnSum
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'zero-or-one',
			argumentTypes: ['item()*'],
			returnType: 'item()?',
			callFunction: fnZeroOrOne
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'one-or-more',
			argumentTypes: ['item()*'],
			returnType: 'item()+',
			callFunction: fnOneOrMore
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'exactly-one',
			argumentTypes: ['item()*'],
			returnType: 'item()',
			callFunction: fnExactlyOne
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'filter',
			argumentTypes: ['item()*', 'function(*)'],
			returnType: 'item()*',
			callFunction: fnFilter
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'for-each',
			argumentTypes: ['item()*', 'function(*)'],
			returnType: 'item()*',
			callFunction: fnForEach
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'fold-left',
			argumentTypes: ['item()*', 'item()*', 'function(*)'],
			returnType: 'item()*',
			callFunction: fnFoldLeft
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'fold-right',
			argumentTypes: ['item()*', 'item()*', 'function(*)'],
			returnType: 'item()*',
			callFunction: fnFoldRight
		}
	],
	functions: {
		avg: fnAvg,
		count: fnCount,
		max: fnMax,
		min: fnMin,
		reverse: fnReverse,
		sum: fnSum
	}
};
