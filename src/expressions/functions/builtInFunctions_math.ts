import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';

import { MATH_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionDefinitionType from './FunctionDefinitionType';

const mathPi: FunctionDefinitionType = (_dynamicContext, _executionParameters, _staticContext) => {
	return sequenceFactory.singleton(createAtomicValue(Math.PI, 'xs:double'));
};

const mathExp: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.pow(Math.E, onlyValue.value), 'xs:double')
	);
};

const mathExp10: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) =>
		createAtomicValue(Math.pow(10, onlyValue.value), 'xs:double')
	);
};

const mathLog: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) => createAtomicValue(Math.log(onlyValue.value), 'xs:double'));
};

const mathLog10: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) => createAtomicValue(Math.log10(onlyValue.value), 'xs:double'));
};

const mathPow: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	base,
	exponent
) => {
	// Note: base is double?, exponent is numeric. In the base is empty case, return empty.
	return exponent.mapAll(([valueY]) =>
		base.map((valueX) => {
			// isFinite is false for +Infinity, -Infinity and NaN
			if (Math.abs(valueX.value) === 1 && !Number.isFinite(valueY.value)) {
				return createAtomicValue(1, 'xs:double');
			}
			return createAtomicValue(Math.pow(valueX.value, valueY.value), 'xs:double');
		})
	);
};

const mathSqrt: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) => createAtomicValue(Math.sqrt(onlyValue.value), 'xs:double'));
};

const mathSin: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) => createAtomicValue(Math.sin(onlyValue.value), 'xs:double'));
};

const mathCos: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) => createAtomicValue(Math.cos(onlyValue.value), 'xs:double'));
};

const mathTan: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) => createAtomicValue(Math.tan(onlyValue.value), 'xs:double'));
};

const mathAsin: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) => createAtomicValue(Math.asin(onlyValue.value), 'xs:double'));
};

const mathAcos: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) => createAtomicValue(Math.acos(onlyValue.value), 'xs:double'));
};

const mathAtan: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((onlyValue) => createAtomicValue(Math.atan(onlyValue.value), 'xs:double'));
};

const mathAtan2: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	x,
	y
) => {
	// Note that x is the double? argument, y is double.
	return y.mapAll(([onlyYValue]) =>
		x.map((onlyXValue) =>
			createAtomicValue(Math.atan2(onlyXValue.value, onlyYValue.value), 'xs:double')
		)
	);
};

export default {
	declarations: [
		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'pi',
			argumentTypes: [],
			returnType: 'xs:double',
			callFunction: mathPi,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'exp',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathExp,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'exp10',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathExp10,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'log',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathLog,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'log10',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathLog10,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'pow',
			argumentTypes: ['xs:double?', 'xs:numeric'],
			returnType: 'xs:double?',
			callFunction: mathPow,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'sqrt',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathSqrt,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'sin',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathSin,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'cos',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathCos,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'tan',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathTan,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'asin',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathAsin,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'acos',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathAcos,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'atan',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathAtan,
		},

		{
			namespaceURI: MATH_NAMESPACE_URI,
			localName: 'atan2',
			argumentTypes: ['xs:double?', 'xs:double'],
			returnType: 'xs:double?',
			callFunction: mathAtan2,
		},
	],
};
