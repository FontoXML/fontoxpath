import isSubtypeOf from '../dataTypes/isSubtypeOf';
import castToType from '../dataTypes/castToType';
import tryCastToType from '../dataTypes/casting/tryCastToType';
import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import MapValue from '../dataTypes/MapValue';
import { transformArgument } from './argumentHelper';

import { DONE_TOKEN, ready, notReady } from '../util/iterators';

function createValidNumericType (type, transformedValue) {
	if (isSubtypeOf(type, 'xs:integer')) {
		return createAtomicValue(transformedValue, 'xs:integer');
	}
	if (isSubtypeOf(type, 'xs:float')) {
		return createAtomicValue(transformedValue, 'xs:float');
	}
	if (isSubtypeOf(type, 'xs:double')) {
		return createAtomicValue(transformedValue, 'xs:double');
	}
	// It must be a decimal, only four numeric types
	return createAtomicValue(transformedValue, 'xs:decimal');
}

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {Sequence}           sequence
 * @return  {Sequence}
 */
function fnAbs (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createValidNumericType(onlyValue.type, Math.abs(onlyValue.value)));
}

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {Sequence}           sequence
 * @return  {Sequence}
 */
function fnCeiling (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createValidNumericType(onlyValue.type, Math.ceil(onlyValue.value)));
}

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {Sequence}           sequence
 * @return  {Sequence}
 */
function fnFloor (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createValidNumericType(onlyValue.type, Math.floor(onlyValue.value)));
}

function isHalf (value, scaling) {
	return value * scaling % 1 % .5 === 0;
}

function getNumberOfDecimalDigits (value) {
	if (Math.floor(value) === value || isNaN(value)) {
		return 0;
	}

	const result = /\d+(?:\.(\d*))?(?:[Ee](-)?(\d+))*/.exec(value + ''),
		decimals = result[1] ? result[1].length : 0;

	if (result[3]) {
		if (result[2]) {
			return decimals + parseInt(result[3], 10);
		}
		const returnVal = decimals - parseInt(result[3], 10);
		return returnVal < 0 ? 0 : returnVal;
	}
	return decimals;
}

/**
 * @param   {boolean}            halfToEven
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {Sequence}           sequence
 * @param   {Sequence}           precision
 * @return  {Sequence}
 */
function fnRound (halfToEven, _dynamicContext, sequence, precision) {
	let done = false;
	return new Sequence({
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			const firstValue = sequence.tryGetFirst();
			if (!firstValue.ready) {
				return notReady(firstValue.promise);
			}
			if (!firstValue.value) {
				// Empty sequence
				done = true;
				return DONE_TOKEN;
			}
			/**
			 * @type {../dataTypes/Value}
			 */
			const item = firstValue.value;
			const value = item.value;

			if ((isSubtypeOf(item.type, 'xs:float') || isSubtypeOf(item.type, 'xs:double')) && (
				value === 0 ||
					isNaN(value) ||
					value === +Infinity ||
					value === -Infinity)) {
				done = true;
				return ready(item);
			}
			let scalingPrecision;
			if (precision) {
				const sp = precision.tryGetFirst();
				if (!sp.ready) {
					return notReady(sp.promise);
				}
				scalingPrecision = sp.value.value;
			} else {
				scalingPrecision = 0;
			}
			done = true;

			if (getNumberOfDecimalDigits(value) < scalingPrecision) {
				return ready(item);
			}

			const originalType = ['xs:integer', 'xs:decimal', 'xs:double', 'xs:float'].find(function (type) {
				return isSubtypeOf(item.type, type);
			});
			const itemAsDecimal = castToType(item, 'xs:decimal');
			const scaling = Math.pow(10, scalingPrecision);
			let roundedNumber = 0;

			if (halfToEven && isHalf(itemAsDecimal.value, scaling)) {
				if (Math.floor(itemAsDecimal.value * scaling) % 2 === 0) {
					roundedNumber = Math.floor(itemAsDecimal.value * scaling) / scaling;
				} else {
					roundedNumber = Math.ceil(itemAsDecimal.value * scaling) / scaling;
				}
			} else {
				roundedNumber = Math.round(itemAsDecimal.value * scaling) / scaling;
			}

			switch (originalType) {
				case 'xs:decimal':
					return ready(createAtomicValue(roundedNumber, 'xs:decimal'));
				case 'xs:double':
					return ready(createAtomicValue(roundedNumber, 'xs:double'));
				case 'xs:float':
					return ready(createAtomicValue(roundedNumber, 'xs:float'));
				case 'xs:integer':
					return ready(createAtomicValue(roundedNumber, 'xs:integer'));
			}
		}
	});
}

/**
 * @param   {../DynamicContext}  dynamicContext
 * @param   {Sequence}           sequence
 * @return  {Sequence}
 */
function fnNumber (dynamicContext, sequence) {
	return sequence.atomize(dynamicContext).switchCases({
		empty: () => Sequence.singleton(createAtomicValue(NaN, 'xs:double')),
		singleton: () => {
			const castResult = tryCastToType(sequence.first(), 'xs:double');
			if (castResult.successful) {
				return Sequence.singleton(castResult.value);
			}
			return Sequence.singleton(createAtomicValue(NaN, 'xs:double'));
		}
	});
}

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {Sequence}           sequence
 * @return  {Sequence}
 */
function returnRandomItemFromSequence (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const sequenceValue = sequence.getAllValues();
	const index = Math.floor(Math.random() * sequenceValue.length);
	return Sequence.singleton(sequenceValue[index]);
}

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {Sequence}           _sequence
 * @return  {Sequence}
 */
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
					transformArgument('xs:anyAtomicType?', Sequence.singleton(dynamicContext.contextItem), dynamicContext, 'fn:number');
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
