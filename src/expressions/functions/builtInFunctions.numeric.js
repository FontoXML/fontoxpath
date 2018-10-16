import isSubtypeOf from '../dataTypes/isSubtypeOf';
import castToType from '../dataTypes/castToType';
import tryCastToType from '../dataTypes/casting/tryCastToType';
import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import MapValue from '../dataTypes/MapValue';
import AtomicValue from '../dataTypes/AtomicValue';
import { transformArgument } from './argumentHelper';

import { DONE_TOKEN, ready, notReady } from '../util/iterators';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import FunctionDefinitionType from './FunctionDefinitionType';

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
 * @type {!FunctionDefinitionType}
 */
function fnAbs (_dynamicContext, _executionParameters, _staticContext, sequence) {
	return sequence.map(onlyValue => createValidNumericType(onlyValue.type, Math.abs(onlyValue.value)));
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnCeiling (_dynamicContext, _executionParameters, _staticContext, sequence) {
	return sequence.map(onlyValue => createValidNumericType(onlyValue.type, Math.ceil(onlyValue.value)));
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnFloor (_dynamicContext, _executionParameters, _staticContext, sequence) {
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

function fnRound (halfToEven, _dynamicContext, _executionParameters, _staticContext, sequence, precision) {
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
			}
			else {
				scalingPrecision = 0;
			}
			done = true;

			if (getNumberOfDecimalDigits(value) < scalingPrecision) {
				return ready(item);
			}

			const originalType = ['xs:integer', 'xs:decimal', 'xs:double', 'xs:float'].find(function (type) {
				return isSubtypeOf(item.type, type);
			});
			const itemAsDecimal = /** @type {AtomicValue<number>} */ (castToType(item, 'xs:decimal'));
			const scaling = Math.pow(10, scalingPrecision);
			let roundedNumber = 0;

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
 * @type {!FunctionDefinitionType}
 */
function fnNumber (_dynamicContext, executionParameters, _staticContext, sequence) {
	return sequence.atomize(executionParameters).switchCases({
		empty: () => Sequence.singleton(createAtomicValue(NaN, 'xs:double')),
		singleton: () => {
			const castResult = tryCastToType(/** @type {!AtomicValue<?>} */ (sequence.first()), 'xs:double');
			if (castResult.successful) {
				return Sequence.singleton(castResult.value);
			}
			return Sequence.singleton(createAtomicValue(NaN, 'xs:double'));
		}
	});
}

/**
 * @type {!FunctionDefinitionType}
 */
function returnRandomItemFromSequence (_dynamicContext, _executionParameters, _staticContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	const sequenceValue = sequence.getAllValues();
	const index = Math.floor(Math.random() * sequenceValue.length);
	return Sequence.singleton(sequenceValue[index]);
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnRandomNumberGenerator (_dynamicContext, _executionParameters, _staticContext, _sequence) {
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
				localName: '',
				namespaceURI: '',
				argumentTypes: [],
				arity: 0,
				returnType: 'map(*)'
			}))
		},
		{
			key: createAtomicValue('permute', 'xs:string'),
			value: Sequence.singleton(new FunctionValue({
				value: returnRandomItemFromSequence,
				localName: '',
				namespaceURI: '',
				argumentTypes: [{ type: 'item()', occurrence: '*' }],
				arity: 1,
				returnType: 'item()*'
			}))
		}
	]));
}

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'abs',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric?',
			callFunction: fnAbs
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'ceiling',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric?',
			callFunction: fnCeiling
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'floor',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric?',
			callFunction: fnFloor
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'round',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric',
			callFunction: /** @type {FunctionDefinitionType} */ (fnRound.bind(null, false))
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'round',
			argumentTypes: ['xs:numeric?', 'xs:integer'],
			returnType: 'xs:numeric',
			callFunction: /** @type {FunctionDefinitionType} */ (fnRound.bind(null, false))
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'round-half-to-even',
			argumentTypes: ['xs:numeric?'],
			returnType: 'xs:numeric',
			callFunction: /** @type {FunctionDefinitionType} */ (fnRound.bind(null, true))
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'round-half-to-even',
			argumentTypes: ['xs:numeric?', 'xs:integer'],
			returnType: 'xs:numeric',
			callFunction: /** @type {FunctionDefinitionType} */ (fnRound.bind(null, true))
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'number',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:double',
			callFunction: fnNumber
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'number',
			argumentTypes: [],
			returnType: 'xs:double',
			callFunction: (dynamicContext, executionParameters, staticContext) => {
				const atomizedContextItem = dynamicContext.contextItem &&
					transformArgument({ type: 'xs:anyAtomicType', occurrence: '?' }, Sequence.singleton(dynamicContext.contextItem), executionParameters, 'fn:number');
				if (!atomizedContextItem) {
					throw new Error('XPDY0002: fn:number needs an atomizable context item.');
				}
				return fnNumber(dynamicContext, executionParameters, staticContext, atomizedContextItem);
			}
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'random-number-generator',
			argumentTypes: [],
			returnType: 'map(*)',
			callFunction: fnRandomNumberGenerator
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'random-number-generator',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'map(*)',
			callFunction: () => {
				throw new Error('Not implemented: Specifying a seed is not supported');
			}
		}
	],
	functions: {
		number: fnNumber,
		round: fnRound
	}
};
