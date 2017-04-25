import BooleanValue from '../dataTypes/BooleanValue';
import DecimalValue from '../dataTypes/DecimalValue';
import DoubleValue from '../dataTypes/DoubleValue';
import FloatValue from '../dataTypes/FloatValue';
import IntegerValue from '../dataTypes/IntegerValue';
import Sequence from '../dataTypes/Sequence';
import { castToType } from '../dataTypes/conversionHelper';

import sequenceDeepEqual from './builtInFunctions.sequences.deepEqual';

/**
 * Promote all given (numeric) items to single common type
 * https://www.w3.org/TR/xpath-31/#promotion
 */
function convertItemsToCommonType (items) {
	if (items.every(function (item) {
		// xs:integer is the only numeric type with inherits from another numeric type
		return item.instanceOfType('xs:integer');
	})) {
		// They are all integers, we do not have to convert them to decimals
		return items;
	}
	var commonTypeName = items.map(function (item) {
		return item.primitiveTypeName;
	}).reduce(function (commonTypeName, itemType) {
		return itemType === commonTypeName ? commonTypeName : null;
	});

	if (commonTypeName !== null) {
		// All items are already of the same type
		return items;
	}

	// If each value is an instance of one of the types xs:string or xs:anyURI, then all the values are cast to type xs:string
	if (items.every(function (item) {
		return item.instanceOfType('xs:string') ||
			item.instanceOfType('xs:anyURI');
	})) {
		return items.map((item) => castToType(item, 'xs:string'));
	}

	// If each value is an instance of one of the types xs:decimal or xs:float, then all the values are cast to type xs:float.
	if (items.every(function (item) {
		return item.instanceOfType('xs:decimal') ||
			item.instanceOfType('xs:float');
	})) {
		return items.map((item) => castToType(item, 'xs:float'));
	}
	// If each value is an instance of one of the types xs:decimal, xs:float, or xs:double, then all the values are cast to type xs:double.
	if (items.every(function (item) {
		return item.instanceOfType('xs:decimal') ||
			item.instanceOfType('xs:float') ||
			item.instanceOfType('xs:double');
	})) {
		return items.map((item) => castToType(item, 'xs:double'));
	}

	// Otherwise, a type error is raised [err:FORG0006].
	throw new Error('FORG0006: Incompatible types to be converted to a common type');
}

function castUntypedItemsToDouble (items) {
	return items.map(function (item) {
		if (item.instanceOfType('xs:untypedAtomic')) {
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
		return [new DoubleValue(NaN)];
	}

	return convertItemsToCommonType(items);
}

function fnEmpty (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return Sequence.singleton(BooleanValue.TRUE);
	}

	return Sequence.singleton(BooleanValue.FALSE);
}

function fnExists (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return Sequence.singleton(BooleanValue.FALSE);
	}

	return Sequence.singleton(BooleanValue.TRUE);
}

function fnHead (_dynamicContext, sequence) {
	if (sequence.isEmpty(sequence)) {
		return sequence;
	}

	return Sequence.singleton(sequence.first());
}

function fnTail (_dynamicContext, sequence) {
	if (sequence.isEmpty(sequence) || sequence.isSingleton()) {
		return Sequence.empty();
	}

	const allItems = sequence.getAllValues();
	return Sequence.singleton(allItems[allItems.length - 1]);
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

	sequenceValue.splice.apply(sequenceValue, [effectivePosition - 1, 0].concat(Array.from(inserts.value())));
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
	return new Sequence(sequence.getAllValues().reverse());
}

function fnSubsequence (_dynamicContext, sequence, startingLoc, length) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const sequenceValue = sequence.getAllValues();
	const startingLocValue = Math.round(startingLoc.first().value);
	const effectiveLength = length ? startingLocValue + Math.round(length.first().value) - 1 : sequence.length;
	return new Sequence(sequenceValue.slice(startingLocValue - 1, effectiveLength));
}

function fnUnordered (_dynamicContext, sequence) {
	return sequence;
}

function fnDeepEqual (dynamicContext, parameter1, parameter2) {
	return Sequence.singleton(
		sequenceDeepEqual(dynamicContext, parameter1, parameter2) ?
			BooleanValue.TRUE :
			BooleanValue.FALSE);
}

function fnCount (_dynamicContext, sequence) {
	return Sequence.singleton(new IntegerValue(sequence.getLength(false)));
}

function fnAvg (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	// TODO: throw FORG0006 if the items contain both yearMonthDurations and dayTimeDurations
	var items = castUntypedItemsToDouble(sequence.getAllValues());
	items = convertItemsToCommonType(items);
	if (!items.every(item => item.instanceOfType('xs:numeric'))) {
		throw new Error('FORG0006: items passed to fn:avg are not all numeric.');
	}

	var resultValue = items.reduce(function (sum, item) {
		return sum + item.value;
	}, 0) / items.length;

	if (items.every(function (item) {
		return item.instanceOfType('xs:integer') || item.instanceOfType('xs:double');
	})) {
		return Sequence.singleton(new DoubleValue(resultValue));
	}

	if (items.every(function (item) {
		return item.instanceOfType('xs:decimal');
	})) {
		return Sequence.singleton(new DecimalValue(resultValue));
	}

	return Sequence.singleton(new FloatValue(resultValue));
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
	if (!items.every(item => item.instanceOfType('xs:numeric'))) {
		throw new Error('FORG0006: items passed to fn:sum are not all numeric.');
	}

	var resultValue = items.reduce(function (sum, item) {
		return sum + item.value;
	}, 0);

	if (items.every(function (item) {
		return item.instanceOfType('xs:integer');
	})) {
		return Sequence.singleton(new IntegerValue(resultValue));
	}

	if (items.every(function (item) {
		return item.instanceOfType('xs:double');
	})) {
		return Sequence.singleton(new DoubleValue(resultValue));
	}

	if (items.every(function (item) {
		return item.instanceOfType('xs:decimal');
	})) {
		return Sequence.singleton(new DecimalValue(resultValue));
	}

	return Sequence.singleton(new FloatValue(resultValue));
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
			callFunction: fnSubsequence
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
				throw new Error('Calling the deep-equal function with a non-default collation is not supported at this moment');
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
				throw new Error('Calling the max function with a non-default collation is not supported at this moment');
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
				throw new Error('Calling the min function with a non-default collation is not supported at this moment');
			}
		},

		{
			name: 'sum',
			argumentTypes: ['xs:anyAtomicType*'],
			returnType: 'xs:anyAtomicType',
			callFunction: function (dynamicContext, sequence) {
				return fnSum(dynamicContext, sequence, Sequence.singleton(new IntegerValue(0)));
			}
		},

		{
			name: 'sum',
			argumentTypes: ['xs:anyAtomicType*', 'xs:anyAtomicType?'],
			returnType: 'xs:anyAtomicType?',
			callFunction: fnSum
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
