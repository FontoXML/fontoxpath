define([
	'../dataTypes/BooleanValue',
	'../dataTypes/DecimalValue',
	'../dataTypes/DoubleValue',
	'../dataTypes/FloatValue',
	'../dataTypes/IntegerValue',
	'../dataTypes/Sequence',
	'../dataTypes/StringValue'
], function (
	BooleanValue,
	DecimalValue,
	DoubleValue,
	FloatValue,
	IntegerValue,
	Sequence,
	StringValue
) {
	'use strict';

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
			return items.map(StringValue.cast);
		}

		// If each value is an instance of one of the types xs:decimal or xs:float, then all the values are cast to type xs:float.
		if (items.every(function (item) {
			return item.instanceOfType('xs:decimal') ||
				item.instanceOfType('xs:float');
		})) {
			return items.map(FloatValue.cast);
		}
		// If each value is an instance of one of the types xs:decimal, xs:float, or xs:double, then all the values are cast to type xs:double.
		if (items.every(function (item) {
			return item.instanceOfType('xs:decimal') ||
				item.instanceOfType('xs:float') ||
				item.instanceOfType('xs:double');
		})) {
			return items.map(DoubleValue.cast);
		}

		// Otherwise, a type error is raised [err:FORG0006].
		throw new Error('FORG0006: Incompatible types to be converted to a common type');
	}

	function castUntypedItemsToDouble (items) {
		return items.map(function (item) {
				if (item.instanceOfType('xs:untypedAtomic')) {
					return DoubleValue.cast(item);
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

	function fnMax (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return sequence;
		}

		var items = castItemsForMinMax(sequence.value);

		// Use first element in array as initial value
		return Sequence.singleton(
			items.reduce(function (max, item) {
				return max.value < item.value ? item : max;
			}));
	}

	function fnMin (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return sequence;
		}

		var items = castItemsForMinMax(sequence.value);

		// Use first element in array as initial value
		return Sequence.singleton(
			items.reduce(function (min, item) {
				return min.value > item.value ? item: min;
			}));
	}

	function fnAvg (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return sequence;
		}

		// TODO: throw FORG0006 if the items contain both yearMonthDurations and dayTimeDurations
		var items = castUntypedItemsToDouble(sequence.value);
		items = convertItemsToCommonType(items);

		var resultValue = items.reduce(function (sum, item) {
				return sum + item.value;
			}, 0) / sequence.value.length;

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

	function fnSum (dynamicContext, sequence, zero) {
		// TODO: throw FORG0006 if the items contain both yearMonthDurations and dayTimeDurations
		if (sequence.isEmpty()) {
			return zero;
		}

		var items = castUntypedItemsToDouble(sequence.value);
		items = convertItemsToCommonType(items);
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

	function fnCount (dynamicContext, sequence) {
		return Sequence.singleton(new IntegerValue(sequence.value.length));
	}

	return [
		{
			name: 'avg',
			typeDescription: ['xs:anyAtomicType*'],
			callFunction: fnAvg
		},


		{
			name: 'count',
			typeDescription: ['item()*'],
			callFunction: fnCount
		},

		{
			name: 'max',
			typeDescription: ['xs:anyAtomicType*'],
			callFunction: fnMax
		},

		{
			name: 'max',
			typeDescription: ['xs:anyAtomicType*', 'xs:string'],
			callFunction: function () {
				throw new Error('Calling the max function with a non-default collation is not supported at this moment');
			}
		},

		{
			name: 'min',
			typeDescription: ['xs:anyAtomicType*'],
			callFunction: fnMin
		},

		{
			name: 'min',
			typeDescription: ['xs:anyAtomicType*', 'xs:string'],
			callFunction: function () {
				throw new Error('Calling the min function with a non-default collation is not supported at this moment');
			}
		},

		{
			name: 'sum',
			typeDescription: ['xs:anyAtomicType*'],
			callFunction: function (dynamicContext, sequence) {
				return fnSum(dynamicContext, sequence, Sequence.singleton(new IntegerValue(0)));
			}
		},

		{
			name: 'sum',
			typeDescription: ['xs:anyAtomicType*', 'xs:anyAtomicType?'],
			callFunction: fnSum
		}
	];
});
