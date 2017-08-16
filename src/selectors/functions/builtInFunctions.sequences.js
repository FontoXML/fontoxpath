import Sequence from '../dataTypes/Sequence';
import castToType from '../dataTypes/castToType';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import createAtomicValue from '../dataTypes/createAtomicValue';
import { getPrimitiveTypeName } from '../dataTypes/typeHelpers';
import { transformArgument } from './argumentHelper';

import sequenceDeepEqual from './builtInFunctions.sequences.deepEqual';
import { DONE_TOKEN, notReady, ready } from '../util/iterators';
import zipSingleton from '../util/zipSingleton';

function subSequence (sequence, start, length) {
	// XPath starts from 1
	let i = 1;
	/**
	 * @type {!Iterator<!../dataTypes/Value>}
	 */
	const iterator = sequence.value();

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
	return new Sequence({
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

function fnEmpty (_dynamicContext, sequence) {
	return sequence.switchCases({
		empty: () => Sequence.singletonTrueSequence(),
		singleton: () => Sequence.singletonFalseSequence(),
		multiple: () => Sequence.singletonFalseSequence()
	});
}

function fnExists (_dynamicContext, sequence) {
	return sequence.switchCases({
		empty: () => Sequence.singletonFalseSequence(),
		singleton: () => Sequence.singletonTrueSequence(),
		multiple: () => Sequence.singletonTrueSequence()
	});
}

function fnHead (_dynamicContext, sequence) {
	return subSequence(sequence, 1, 1);
}

function fnTail (_dynamicContext, sequence) {
	return subSequence(sequence, 2, null);
}

function fnInsertBefore (_dynamicContext, sequence, position, inserts) {
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
	return new Sequence(sequenceValue);
}

function fnRemove (_dynamicContext, sequence, position) {
	const effectivePosition = position.first().value;
	const sequenceValue = sequence.getAllValues();
	if (!sequenceValue.length || effectivePosition < 1 || effectivePosition > sequenceValue.length) {
		return new Sequence(sequenceValue);
	}
	sequenceValue.splice(effectivePosition - 1, 1);
	return new Sequence(sequenceValue);
}

function fnReverse (_dynamicContext, sequence) {
	return sequence.mapAll(allValues => new Sequence(allValues.reverse()));
}

function fnSubsequence (_dynamicContext, sequence, startSequence, lengthSequence) {
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

function fnUnordered (_dynamicContext, sequence) {
	return sequence;
}

function fnDeepEqual (dynamicContext, parameter1, parameter2) {
	return new Sequence(sequenceDeepEqual(dynamicContext, parameter1, parameter2)).map(jsValue => createAtomicValue(jsValue, 'xs:boolean'));
}

function fnCount (_dynamicContext, sequence) {
	let hasPassed = false;
	return new Sequence({
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

function fnAvg (_dynamicContext, sequence) {
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

function fnMax (_dynamicContext, sequence) {
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

function fnMin (_dynamicContext, sequence) {
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

function fnSum (_dynamicContext, sequence, zero) {
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

function fnZeroOrOne (_dynamicContext, arg) {
	if (!arg.isEmpty() && !arg.isSingleton()) {
		throw new Error('FORG0003: The argument passed to fn:zero-or-one contained more than one item.');
	}
	return arg;
}

function fnOneOrMore (_dynamicContext, arg) {
	if (arg.isEmpty()) {
		throw new Error('FORG0004: The argument passed to fn:one-or-more was empty.');
	}
	return arg;
}

function fnExactlyOne (_dynamicContext, arg) {
	if (!arg.isSingleton()) {
		throw new Error('FORG0005: The argument passed to fn:zero-or-one is empty or contained more then one item.');
	}
	return arg;
}

function fnFilter (dynamicContext, sequence, callbackSequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	/**
	 * @type {../dataTypes/FunctionValue}
	 */
	const callbackFn = callbackSequence.first();
	return sequence.filter(item => {
		// Tranform argument
		const transformedArgument = transformArgument(
			callbackFn.getArgumentTypes()[0],
			Sequence.singleton(item),
			dynamicContext,
			'fn:filter');
		const functionCallResult = callbackFn.value.call(undefined, dynamicContext, transformedArgument);
		if (!functionCallResult.isSingleton() || !isSubtypeOf(functionCallResult.first().type, 'xs:boolean')) {
			throw new Error(`XPTY0004: signature of function passed to fn:filter is incompatible.`);
		}
		return functionCallResult.first().value;
	});
}

export default {
	declarations: [
		{
			name: 'empty',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnEmpty
		},

		{
			name: 'exists',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnExists
		},

		{
			name: 'head',
			argumentTypes: ['item()*'],
			returnType: 'item()?',
			callFunction: fnHead
		},

		{
			name: 'tail',
			argumentTypes: ['item()*'],
			returnType: 'item()*',
			callFunction: fnTail
		},

		{
			name: 'insert-before',
			argumentTypes: ['item()*', 'xs:integer', 'item()*'],
			returnType: 'item()*',
			callFunction: fnInsertBefore
		},

		{
			name: 'remove',
			argumentTypes: ['item()*', 'xs:integer'],
			returnType: 'item()*',
			callFunction: fnRemove
		},

		{
			name: 'reverse',
			argumentTypes: ['item()*'],
			returnType: 'item()*',
			callFunction: fnReverse
		},

		{
			name: 'subsequence',
			argumentTypes: ['item()*', 'xs:double'],
			returnType: 'item()*',
			callFunction: (dynamicContext, sequence, start) =>
				fnSubsequence(dynamicContext, sequence, start, Sequence.empty())
		},

		{
			name: 'subsequence',
			argumentTypes: ['item()*', 'xs:double', 'xs:double'],
			returnType: 'item()*',
			callFunction: fnSubsequence
		},

		{
			name: 'unordered',
			argumentTypes: ['item()*'],
			returnType: 'item()*',
			callFunction: fnUnordered
		},

		{
			name: 'deep-equal',
			argumentTypes: ['item()*', 'item()*'],
			returnType: 'xs:boolean',
			callFunction: fnDeepEqual
		},

		{
			name: 'deep-equal',
			argumentTypes: ['item()*', 'item()*', 'xs:string'],
			returnType: 'xs:boolean',
			callFunction: function () {
				throw new Error('FOCH0002: No collations are supported');
			}
		},

		{
			name: 'count',
			argumentTypes: ['item()*'],
			returnType: 'xs:integer',
			callFunction: fnCount
		},

		{
			name: 'avg',
			argumentTypes: ['xs:anyAtomicType*'],
			returnType: 'xs:anyAtomicType?',
			callFunction: fnAvg
		},

		{
			name: 'max',
			argumentTypes: ['xs:anyAtomicType*'],
			returnType: 'xs:anyAtomicType?',
			callFunction: fnMax
		},

		{
			name: 'max',
			argumentTypes: ['xs:anyAtomicType*', 'xs:string'],
			returnType: 'xs:anyAtomicType?',
			callFunction: function () {
				throw new Error('FOCH0002: No collations are supported');
			}
		},

		{
			name: 'min',
			argumentTypes: ['xs:anyAtomicType*'],
			returnType: 'xs:anyAtomicType?',
			callFunction: fnMin
		},

		{
			name: 'min',
			argumentTypes: ['xs:anyAtomicType*', 'xs:string'],
			returnType: 'xs:anyAtomicType?',
			callFunction: function () {
				throw new Error('FOCH0002: No collations are supported');
			}
		},

		{
			name: 'sum',
			argumentTypes: ['xs:anyAtomicType*'],
			returnType: 'xs:anyAtomicType',
			callFunction: function (dynamicContext, sequence) {
				return fnSum(dynamicContext, sequence, Sequence.singleton(createAtomicValue(0, 'xs:integer')));
			}
		},

		{
			name: 'sum',
			argumentTypes: ['xs:anyAtomicType*', 'xs:anyAtomicType?'],
			returnType: 'xs:anyAtomicType?',
			callFunction: fnSum
		},

		{
			name: 'zero-or-one',
			argumentTypes: ['item()*'],
			returnType: 'item()?',
			callFunction: fnZeroOrOne
		},

		{
			name: 'one-or-more',
			argumentTypes: ['item()*'],
			returnType: 'item()+',
			callFunction: fnOneOrMore
		},

		{
			name: 'exactly-one',
			argumentTypes: ['item()*'],
			returnType: 'item()',
			callFunction: fnExactlyOne
		},

		{
			name: 'filter',
			argumentTypes: ['item()*', 'function(*)'],
			returnType: 'item()',
			callFunction: fnFilter
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
