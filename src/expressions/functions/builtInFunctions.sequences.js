import Sequence from '../dataTypes/Sequence';
import castToType from '../dataTypes/castToType';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import createAtomicValue from '../dataTypes/createAtomicValue';
import { getPrimitiveTypeName } from '../dataTypes/typeHelpers';
import { transformArgument } from './argumentHelper';

import sequenceDeepEqual from './builtInFunctions.sequences.deepEqual';
import { DONE_TOKEN, notReady, ready } from '../util/iterators';
import zipSingleton from '../util/zipSingleton';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import FunctionValue from '../dataTypes/FunctionValue';
import Value from '../dataTypes/Value';
import FunctionDefinitionType from'./FunctionDefinitionType';

function subSequence (sequence, start, length) {
	// XPath starts from 1
	let i = 1;
	/**
	 * @type {!Iterator<!Value>}
	 */
	const iterator = sequence.value;

	const predictedLength = sequence.tryGetLength(true);
	let newSequenceLength = null;
	const startIndex = Math.max(start - 1, 0);
	if (predictedLength.ready && predictedLength.value !== -1) {
		let endIndex;
		if (length === null) {
			endIndex = predictedLength.value;
		} else {
			endIndex = Math.max(0, Math.min(predictedLength.value, length + (start - 1)));
		}
		newSequenceLength = Math.max(0, endIndex - startIndex);
	}
	return Sequence.create({
		next: () => {
			while (i < start) {
				const val = iterator.next();
				if (!val.ready) {
					return val;
				}
				i++;
			}
			if (length !== null && i >= start + length) {
				return DONE_TOKEN;
			}

			const val = iterator.next();
			if (!val.ready) {
				return val;
			}
			i++;

			return val;
		}
	}, newSequenceLength);
}

/**
 * Promote all given (numeric) items to single common type
 * https://www.w3.org/TR/xpath-31/#promotion
 */
function convertItemsToCommonType (items) {
	if (items.every(function (item) {
		// xs:integer is the only numeric type with inherits from another numeric type
		return isSubtypeOf(item.type, 'xs:integer') || isSubtypeOf(item.type, 'xs:decimal');
	})) {
		// They are all integers, we do not have to convert them to decimals
		return items;
	}
	var commonTypeName = items.map(item => getPrimitiveTypeName(item.type)).reduce((commonTypeName, itemType) => {
		return itemType === commonTypeName ? commonTypeName : null;
	});

	if (commonTypeName !== null) {
		// All items are already of the same type
		return items;
	}

	// If each value is an instance of one of the types xs:string or xs:anyURI, then all the values are cast to type xs:string
	if (items.every(function (item) {
		return isSubtypeOf(item.type, 'xs:string') ||
			isSubtypeOf(item.type, 'xs:anyURI');
	})) {
		return items.map((item) => castToType(item, 'xs:string'));
	}

	// If each value is an instance of one of the types xs:decimal or xs:float, then all the values are cast to type xs:float.
	if (items.every(function (item) {
		return isSubtypeOf(item.type, 'xs:decimal') ||
			isSubtypeOf(item.type, 'xs:float');
	})) {
		return items.map((item) => castToType(item, 'xs:float'));
	}
	// If each value is an instance of one of the types xs:decimal, xs:float, or xs:double, then all the values are cast to type xs:double.
	if (items.every(function (item) {
		return isSubtypeOf(item.type, 'xs:decimal') ||
			isSubtypeOf(item.type, 'xs:float') ||
			isSubtypeOf(item.type, 'xs:double');
	})) {
		return items.map((item) => castToType(item, 'xs:double'));
	}

	// Otherwise, a type error is raised [err:FORG0006].
	throw new Error('FORG0006: Incompatible types to be converted to a common type');
}

function castUntypedItemsToDouble (items) {
	return items.map(function (item) {
		if (isSubtypeOf(item.type, 'xs:untypedAtomic')) {
			return castToType(item, 'xs:double');
		}
		return item;
	});
}

function castItemsForMinMax (items) {
	// Values of type xs:untypedAtomic in $arg are cast to xs:double.
	items = castUntypedItemsToDouble(items);

	if (items.some(function (item) {
		return Number.isNaN(item.value);
	})) {
		return [createAtomicValue(NaN, 'xs:double')];
	}

	return convertItemsToCommonType(items);
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnEmpty (_dynamicContext, _executionParameters, _staticContext, sequence) {
	return sequence.switchCases({
		empty: () => Sequence.singletonTrueSequence(),
		singleton: () => Sequence.singletonFalseSequence(),
		multiple: () => Sequence.singletonFalseSequence()
	});
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnExists (_dynamicContext, _executionParameters, _staticContext, sequence) {
	return sequence.switchCases({
		empty: () => Sequence.singletonFalseSequence(),
		singleton: () => Sequence.singletonTrueSequence(),
		multiple: () => Sequence.singletonTrueSequence()
	});
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnHead (_dynamicContext, _executionParameters, _staticContext, sequence) {
	return subSequence(sequence, 1, 1);
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnTail (_dynamicContext, _executionParameters, _staticContext, sequence) {
	return subSequence(sequence, 2, null);
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnInsertBefore (_dynamicContext, _executionParameters, _staticContext, sequence, position, inserts) {
	if (sequence.isEmpty()) {
		return inserts;
	}

	if (inserts.isEmpty()) {
		return sequence;
	}
	const sequenceValue = sequence.getAllValues();

	let effectivePosition = position.first().value;
	if (effectivePosition < 1) {
		effectivePosition = 1;
	}
	else if (effectivePosition > sequenceValue.length) {
		effectivePosition = sequenceValue.length + 1;
	}

	sequenceValue.splice.apply(sequenceValue, [effectivePosition - 1, 0].concat(inserts.getAllValues()));
	return Sequence.create(sequenceValue);
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnRemove (_dynamicContext, _executionParameters, _staticContext, sequence, position) {
	const effectivePosition = position.first().value;
	const sequenceValue = sequence.getAllValues();
	if (!sequenceValue.length || effectivePosition < 1 || effectivePosition > sequenceValue.length) {
		return Sequence.create(sequenceValue);
	}
	sequenceValue.splice(effectivePosition - 1, 1);
	return Sequence.create(sequenceValue);
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnReverse (_dynamicContext, _executionParameters, _staticContext, sequence) {
	return sequence.mapAll(allValues => Sequence.create(allValues.reverse()));
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnSubsequence (_dynamicContext, _executionParameters, _staticContext, sequence, startSequence, lengthSequence) {
	return zipSingleton(
		[startSequence, lengthSequence],
		([startVal, lengthVal]) => {
			if (startVal.value === Infinity) {
				return Sequence.empty();
			}
			if (startVal.value === -Infinity) {
				if (lengthVal && lengthVal.value === Infinity) {
					return Sequence.empty();
				}
				return sequence;
			}
			if (lengthVal) {
				if (isNaN(lengthVal.value)) {
					return Sequence.empty();
				}
				if (lengthVal.value === Infinity) {
					lengthVal = null;
				}
			}
			if (isNaN(startVal.value)) {
				return Sequence.empty();
			}
			return subSequence(
				sequence,
				Math.round(startVal.value),
				lengthVal ? Math.round(lengthVal.value) : null);
		});
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnUnordered (_dynamicContext, _executionParameters, _staticContext, sequence) {
	return sequence;
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnDeepEqual (dynamicContext, executionParameters, staticContext, parameter1, parameter2) {
	let hasPassed = false;
	const deepEqualityIterator = sequenceDeepEqual(
			dynamicContext,
			executionParameters,
			staticContext,
			parameter1,
			parameter2);

	return Sequence.create({
		next: () => {
			if (hasPassed) {
				return DONE_TOKEN;
			}
			const result = deepEqualityIterator.next();
			if (!result.ready || result.done) {
				return result;
			}
			hasPassed = true;
			return ready(createAtomicValue(result.value, 'xs:boolean'));
		}
	});
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnCount (_dynamicContext, _executionParameters, _staticContext, sequence) {
	let hasPassed = false;
	return Sequence.create({
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
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnAvg (_dynamicContext, _executionParameters, _staticContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	// TODO: throw FORG0006 if the items contain both yearMonthDurations and dayTimeDurations
	var items = castUntypedItemsToDouble(sequence.getAllValues());
	items = convertItemsToCommonType(items);
	if (!items.every(item => isSubtypeOf(item.type, 'xs:numeric'))) {
		throw new Error('FORG0006: items passed to fn:avg are not all numeric.');
	}

	var resultValue = items.reduce(function (sum, item) {
		return sum + item.value;
	}, 0) / items.length;

	if (items.every(function (item) {
		return isSubtypeOf(item.type, 'xs:integer') || isSubtypeOf(item.type, 'xs:double');
	})) {
		return Sequence.singleton(createAtomicValue(resultValue, 'xs:double'));
	}

	if (items.every(function (item) {
		return isSubtypeOf(item.type, 'xs:decimal');
	})) {
		return Sequence.singleton(createAtomicValue(resultValue, 'xs:decimal'));
	}

	return Sequence.singleton(createAtomicValue(resultValue, 'xs:float'));
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnMax (_dynamicContext, _executionParameters, _staticContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	var items = castItemsForMinMax(sequence.getAllValues());

	// Use first element in array as initial value
	return Sequence.singleton(
		items.reduce(function (max, item) {
			return max.value < item.value ? item : max;
		}));
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnMin (_dynamicContext, _executionParameters, _staticContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	var items = castItemsForMinMax(sequence.getAllValues());

	// Use first element in array as initial value
	return Sequence.singleton(
		items.reduce(function (min, item) {
			return min.value > item.value ? item : min;
		}));
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnSum (_dynamicContext, _executionParameters, _staticContext, sequence, zero) {
	// TODO: throw FORG0006 if the items contain both yearMonthDurations and dayTimeDurations
	if (sequence.isEmpty()) {
		return zero;
	}

	var items = castUntypedItemsToDouble(sequence.getAllValues());
	items = convertItemsToCommonType(items);
	if (!items.every(item => isSubtypeOf(item.type, 'xs:numeric'))) {
		throw new Error('FORG0006: items passed to fn:sum are not all numeric.');
	}

	var resultValue = items.reduce(function (sum, item) {
		return sum + item.value;
	}, 0);

	if (items.every(function (item) {
		return isSubtypeOf(item.type, 'xs:integer');
	})) {
		return Sequence.singleton(createAtomicValue(resultValue, 'xs:integer'));
	}

	if (items.every(function (item) {
		return isSubtypeOf(item.type, 'xs:double');
	})) {
		return Sequence.singleton(createAtomicValue(resultValue, 'xs:double'));
	}

	if (items.every(function (item) {
		return isSubtypeOf(item.type, 'xs:decimal');
	})) {
		return Sequence.singleton(createAtomicValue(resultValue, 'xs:decimal'));
	}

	return Sequence.singleton(createAtomicValue(resultValue, 'xs:float'));
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnZeroOrOne (_dynamicContext, _executionParameters, _staticContext, arg) {
	if (!arg.isEmpty() && !arg.isSingleton()) {
		throw new Error('FORG0003: The argument passed to fn:zero-or-one contained more than one item.');
	}
	return arg;
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnOneOrMore (_dynamicContext, _executionParameters, _staticContext, arg) {
	if (arg.isEmpty()) {
		throw new Error('FORG0004: The argument passed to fn:one-or-more was empty.');
	}
	return arg;
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnExactlyOne (_dynamicContext, _executionParameters, _staticContext, arg) {
	if (!arg.isSingleton()) {
		throw new Error('FORG0005: The argument passed to fn:zero-or-one is empty or contained more then one item.');
	}
	return arg;
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnFilter (dynamicContext, executionParameters, staticContext, sequence, callbackSequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	/**
	 * @type {FunctionValue}
	 */
	const callbackFn = callbackSequence.first();
	const callbackArgumentTypes = callbackFn.getArgumentTypes();
	if (callbackArgumentTypes.length !== 1) {
		throw new Error(`XPTY0004: signature of function passed to fn:filter is incompatible.`);
	}

	return sequence.filter(item => {
		// Transform argument
		const transformedArgument = transformArgument(
			callbackArgumentTypes[0],
			Sequence.singleton(item),
			executionParameters,
			'fn:filter');
		const functionCallResult = callbackFn.value.call(
			undefined,
			dynamicContext,
			executionParameters,
			staticContext,
			transformedArgument);
		if (!functionCallResult.isSingleton() || !isSubtypeOf(functionCallResult.first().type, 'xs:boolean')) {
			throw new Error(`XPTY0004: signature of function passed to fn:filter is incompatible.`);
		}
		return /** @type {boolean} */ (functionCallResult.first().value);
	});
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnForEach (dynamicContext, executionParameters, staticContext, sequence, callbackSequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	/**
	 * @type {FunctionValue}
	 */
	const callbackFn = callbackSequence.first();
	const callbackArgumentTypes = callbackFn.getArgumentTypes();
	if (callbackArgumentTypes.length !== 1) {
		throw new Error(`XPTY0004: signature of function passed to fn:for-each is incompatible.`);
	}

	const outerIterator = sequence.value;
	let innerIterator;
	return Sequence.create({
		next: () => {
			while (true) {
				if (!innerIterator) {
					const item = outerIterator.next();

					if (!item.ready || item.done) {
						return item;
					}

					const transformedArgument = transformArgument(
						callbackArgumentTypes[0],
						Sequence.singleton(/** @type {!Value} */(item.value)),
						executionParameters,
						'fn:for-each');
					const nextSequence = callbackFn.value.call(
						undefined,
						dynamicContext,
						executionParameters,
						staticContext,
						transformedArgument);

					innerIterator = nextSequence.value;
				}

				const entry = innerIterator.next();
				if (!entry.done) {
					return entry;
				}
				innerIterator = null;
			}
		}
	});
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnFoldLeft (dynamicContext, executionParameters, staticContext, sequence, zero, callbackSequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	/**
	 * @type {FunctionValue}
	 */
	const callbackFn = callbackSequence.first();
	const callbackArgumentTypes = callbackFn.getArgumentTypes();
	if (callbackArgumentTypes.length !== 2) {
		throw new Error(`XPTY0004: signature of function passed to fn:fold-left is incompatible.`);
	}

	return sequence.mapAll(values =>
		values.reduce((previous, current) => {
			const previousArg = transformArgument(
				callbackArgumentTypes[0],
				previous,
				executionParameters,
				'fn:fold-left');
			const currentArg = transformArgument(
				callbackArgumentTypes[1],
				Sequence.singleton(current),
				executionParameters,
				'fn:fold-left');
			return callbackFn.value.call(
				undefined,
				dynamicContext,
				executionParameters,
				staticContext,
				previousArg,
				currentArg);
		}, zero)
	);
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnFoldRight (dynamicContext, executionParameters, staticContext, sequence, zero, callbackSequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	/**
	 * @type {FunctionValue}
	 */
	const callbackFn = callbackSequence.first();
	const callbackArgumentTypes = callbackFn.getArgumentTypes();
	if (callbackArgumentTypes.length !== 2) {
		throw new Error(`XPTY0004: signature of function passed to fn:fold-right is incompatible.`);
	}

	return sequence.mapAll(values =>
		values.reduceRight((previous, current) => {
			const previousArg = transformArgument(
				callbackArgumentTypes[0],
				previous,
				executionParameters,
				'fn:fold-right');
			const currentArg = transformArgument(
				callbackArgumentTypes[1],
				Sequence.singleton(current),
				executionParameters,
				'fn:fold-right');
			return callbackFn.value.call(
				undefined,
				dynamicContext,
				executionParameters,
				staticContext,
				currentArg,
				previousArg);
		}, zero)
	);
}

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
				fnSubsequence(dynamicContext, executionParameters, _staticContext, sequence, start, Sequence.empty())
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
			callFunction: function () {
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
			callFunction: function () {
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
			callFunction: function () {
				throw new Error('FOCH0002: No collations are supported');
			}
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'sum',
			argumentTypes: ['xs:anyAtomicType*'],
			returnType: 'xs:anyAtomicType',
			callFunction: function (dynamicContext, executionParameters, _staticContext, sequence) {
				return fnSum(dynamicContext, executionParameters, _staticContext, sequence, Sequence.singleton(createAtomicValue(0, 'xs:integer')));
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
