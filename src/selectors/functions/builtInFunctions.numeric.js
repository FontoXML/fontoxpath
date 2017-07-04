import isSubtypeOf from '../dataTypes/isSubtypeOf';
import castToType from '../dataTypes/castToType';
import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import MapValue from '../dataTypes/MapValue';
import { transformArgument } from './argumentHelper';

function createValidNumericType (value, transformedValue) {
	if (isSubtypeOf(value.type, 'xs:integer')) {
		return Sequence.singleton(createAtomicValue(transformedValue, 'xs:integer'));
	}
	if (isSubtypeOf(value.type, 'xs:float')) {
		return Sequence.singleton(createAtomicValue(transformedValue, 'xs:float'));
	}
	if (isSubtypeOf(value.type, 'xs:double')) {
		return Sequence.singleton(createAtomicValue(transformedValue, 'xs:double'));
	}
	// It must be a decimal, only four numeric types
	return Sequence.singleton(createAtomicValue(transformedValue, 'xs:decimal'));
}

function fnAbs (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return createValidNumericType(sequence.first(), Math.abs(sequence.first().value));
}

function fnCeiling (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return createValidNumericType(sequence.first(), Math.ceil(sequence.first().value));
}

function fnFloor (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return createValidNumericType(sequence.first(), Math.floor(sequence.first().value));
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

	var item = sequence.first(),
		value = item.value;

	if ((isSubtypeOf(item.type, 'xs:float') || isSubtypeOf(item.type, 'xs:double')) && (
		value === 0 ||
		isNaN(value) ||
		value === +Infinity ||
		value === -Infinity)) {
		return Sequence.singleton(item);
	}

	var scalingPrecision = precision ? precision.first().value : 0;
	if (getNumberOfDecimalDigits(value) < scalingPrecision) {
		return sequence;
	}

	var originalType = ['xs:integer', 'xs:decimal', 'xs:double', 'xs:float'].find(function (type) {
				return isSubtypeOf(item.type, type);
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
			return Sequence.singleton(createAtomicValue(roundedNumber, 'xs:decimal'));
		case 'xs:double':
			return Sequence.singleton(createAtomicValue(roundedNumber, 'xs:double'));
		case 'xs:float':
			return Sequence.singleton(createAtomicValue(roundedNumber, 'xs:float'));
		case 'xs:integer':
			return Sequence.singleton(createAtomicValue(roundedNumber, 'xs:integer'));
	}
}

function fnNumber (_dynamicContext, sequence) {
	return sequence.mapToEmptyOrSingleton({
		empty: () => createAtomicValue(NaN, 'xs:double'),
		singleton: first => {
			try {
				return Sequence.singleton(castToType(first, 'xs:double'));
			}
			catch (error) {
				if (error.message.includes('FORG0001')) {
					return createAtomicValue(NaN, 'xs:double');
				}
				throw error;
			}
		}
	});
}

function returnRandomItemFromSequence (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const sequenceValue = sequence.getAllValues();
	const index = Math.floor(Math.random() * sequenceValue.length);
	return Sequence.singleton(sequenceValue[index]);
}

function fnRandomNumberGenerator (_dynamicContext, _sequence) {
	// Ignore the optional seed, as Math.random does not support a seed
	return Sequence.singleton(new MapValue([
		{
			key: createAtomicValue('number', 'xs:string'),
			value: Sequence.singleton(createAtomicValue(Math.random(), 'xs:double'))
		},
		{
			key: createAtomicValue('next', 'xs:string'),
			value: Sequence.singleton(new FunctionValue({
				value: fnRandomNumberGenerator,
				name: '',
				argumentTypes: [],
				arity: 0,
				returnType: 'map(*)'
			}))
		},
		{
			key: createAtomicValue('permute', 'xs:string'),
			value: Sequence.singleton(new FunctionValue({
				value: returnRandomItemFromSequence,
				name: '',
				argumentTypes: ['item()*'],
				arity: 1,
				returnType: 'item()*'
			}))
		}
	]));
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
			callFunction: (dynamicContext) => {
				const atomizedContextItem = dynamicContext.contextItem &&
					transformArgument('xs:anyAtomicType?', Sequence.singleton(dynamicContext.contextItem), dynamicContext);
				if (!atomizedContextItem) {
					throw new Error('XPDY0002: fn:number needs an atomizable context item.');
				}
				return fnNumber(dynamicContext, atomizedContextItem);
			}
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
		}
	],
	functions: {
		number: fnNumber
	}
};
