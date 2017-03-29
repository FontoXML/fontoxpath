import DecimalValue from '../dataTypes/DecimalValue';
import DoubleValue from '../dataTypes/DoubleValue';
import FloatValue from '../dataTypes/FloatValue';
import FunctionItem from '../dataTypes/FunctionItem';
import IntegerValue from '../dataTypes/IntegerValue';
import MapValue from '../dataTypes/MapValue';
import Sequence from '../dataTypes/Sequence';
import StringValue from '../dataTypes/StringValue';
import { castToType } from '../dataTypes/conversionHelper';

function contextItemAsFirstArgument (fn, dynamicContext) {
	return fn(dynamicContext, dynamicContext.contextItem);
}

function createValidNumericType (typedValue, transformedValue) {
	if (typedValue.instanceOfType('xs:integer')) {
		return Sequence.singleton(new IntegerValue(transformedValue));
	}
	if (typedValue.instanceOfType('xs:float')) {
		return Sequence.singleton(new FloatValue(transformedValue));
	}
	if (typedValue.instanceOfType('xs:double')) {
		return Sequence.singleton(new DoubleValue(transformedValue));
	}
	// It must be a decimal, only four numeric types
	return Sequence.singleton(new DecimalValue(transformedValue));
}

function fnAbs (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return createValidNumericType(sequence.value[0], Math.abs(sequence.value[0].value));
}

function fnCeiling (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return createValidNumericType(sequence.value[0], Math.ceil(sequence.value[0].value));
}

function fnFloor (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return createValidNumericType(sequence.value[0], Math.floor(sequence.value[0].value));
}

function isHalf (value, scaling) {
	return value * scaling % 1 % .5 === 0;
}

function getNumberOfDecimalDigits (value) {
	if (Math.floor(value) === value || isNaN(value)) {
		return 0;
	}

	var result = /\d+(?:\.(\d*))?(?:[Ee](-)?(\d+))*/.exec(value + ''),
		decimals = result[1] ? result[1].length : 0;

	if (result[3]) {
		if (result[2]) {
			return decimals + parseInt(result[3], 10);
		}
		var returnVal = decimals - parseInt(result[3], 10);
		return returnVal < 0 ? 0 : returnVal;
	}
	return decimals;
}

function fnRound (halfToEven, _dynamicContext, sequence, precision) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	var item = sequence.value[0],
		value = item.value;

	if ((item.instanceOfType('xs:float') || item.instanceOfType('xs:double')) && (
		value === 0 ||
		isNaN(value) ||
		value === +Infinity ||
		value === -Infinity)) {
		return Sequence.singleton(item);
	}

	var scalingPrecision = precision ? precision.value[0].value : 0;
	if (getNumberOfDecimalDigits(value) < scalingPrecision) {
		return sequence;
	}

	var originalType = ['xs:integer', 'xs:decimal', 'xs:double', 'xs:float'].find(function (type) {
				return item.instanceOfType(type);
			}),
		itemAsDecimal = castToType(item, 'xs:decimal'),
		scaling = Math.pow(10, scalingPrecision),
		roundedNumber = 0;

	if (halfToEven && isHalf(itemAsDecimal.value, scaling)) {
		if (Math.floor(itemAsDecimal.value * scaling) % 2 === 0) {
			roundedNumber = Math.floor(itemAsDecimal.value * scaling) / scaling;
		}
		else {
			roundedNumber = Math.ceil(itemAsDecimal.value * scaling) / scaling;
		}
	}
	else {
		roundedNumber = Math.round(itemAsDecimal.value * scaling) / scaling;
	}

	switch (originalType) {
		case 'xs:decimal':
			return Sequence.singleton(new DecimalValue(roundedNumber));
		case 'xs:double':
			return Sequence.singleton(new DoubleValue(roundedNumber));
		case 'xs:float':
			return Sequence.singleton(new FloatValue(roundedNumber));
		case 'xs:integer':
			return Sequence.singleton(new IntegerValue(roundedNumber));
	}
}

function fnNumber (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return Sequence.singleton(new DoubleValue(NaN));
	}
	try {
		return Sequence.singleton(castToType(sequence.value[0], 'xs:double'));
	}
	catch (error) {
		if (error.message.includes('FORG0001')) {
			return Sequence.singleton(new DoubleValue(NaN));
		}
		throw error;
	}
}

function returnRandomItemFromSequence (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	var index = Math.floor(Math.random() * sequence.value.length);
	return Sequence.singleton(sequence.value[index]);
}

function fnRandomNumberGenerator (_dynamicContext, _sequence) {
	// Ignore the optional seed, as Math.random does not support a seed
	return Sequence.singleton(new MapValue([
		{
			key: new StringValue('number'),
			value: Sequence.singleton(new DoubleValue(Math.random()))
		},
		{
			key: new StringValue('next'),
			value: Sequence.singleton(new FunctionItem(fnRandomNumberGenerator, '', [], 0, 'map(*)'))
		},
		{
			key: new StringValue('permute'),
			value: Sequence.singleton(new FunctionItem(returnRandomItemFromSequence, '', ['item()*'], 1, 'item()*'))
		}
	]));
}

function xsFloat (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(castToType(sequence.value[0], 'xs:float'));
}

function xsInteger (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(castToType(sequence.value[0], 'xs:integer'));
}

function xsDecimal (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(castToType(sequence.value[0], 'xs:decimal'));
}


function xsDouble (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(castToType(sequence.value[0], 'xs:double'));
}

export default {
	declarations: [
		{
			name: 'abs',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric?',
			callFunction: fnAbs
		},

		{
			name: 'ceiling',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric?',
			callFunction: fnCeiling
		},

		{
			name: 'floor',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric?',
			callFunction: fnFloor
		},

		{
			name: 'round',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric',
			callFunction: fnRound.bind(null, false)
		},

		{
			name: 'round',
			argumentTypes: ['xs:numeric?', 'xs:integer'],
			returnType: 'xs:numeric',
			callFunction: fnRound.bind(null, false)
		},

		{
			name: 'round-half-to-even',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric',
			callFunction: fnRound.bind(null, true)
		},

		{
			name: 'round-half-to-even',
			argumentTypes: ['xs:numeric?', 'xs:integer'],
			returnType: 'xs:numeric',
			callFunction: fnRound.bind(null, true)
		},

		{
			name: 'number',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:double',
			callFunction: fnNumber
		},

		{
			name: 'number',
			argumentTypes: [],
			returnType: 'xs:double',
			callFunction: contextItemAsFirstArgument.bind(null, fnNumber)
		},

		{
			name: 'random-number-generator',
			argumentTypes: [],
			returnType: 'map(*)',
			callFunction: fnRandomNumberGenerator
		},

		{
			name: 'random-number-generator',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'map(*)',
			callFunction: () => {
				throw new Error('Not implemented: Specifying a seed is not supported');
			}
		},

		{
			name: 'xs:float',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:float?',
			callFunction: xsFloat
		},

		{
			name: 'xs:integer',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:integer?',
			callFunction: xsInteger
		},

		{
			name: 'xs:decimal',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:decimal?',
			callFunction: xsDecimal
		},

		{
			name: 'xs:double',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:double?',
			callFunction: xsDouble
		}
	],
	functions: {
		number: fnNumber
	}
};
