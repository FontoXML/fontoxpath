import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';

function mathPi (_dynamicContext) {
	return Sequence.singleton(createAtomicValue(Math.PI, 'xs:double'));
}

function mathExp (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createAtomicValue(Math.pow(Math.E, onlyValue.value), 'xs:double'));
}

function mathExp10 (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createAtomicValue(Math.pow(10, onlyValue.value), 'xs:double'));
}

function mathLog (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createAtomicValue(Math.log(onlyValue.value), 'xs:double'));
}

function mathLog10 (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createAtomicValue(Math.log10(onlyValue.value), 'xs:double'));
}

function mathPow (_dynamicContext, base, exponent) {
	// Note: base is double?, exponent is numeric. In the base is empty case, return empty.
	return exponent.mapAll(
		([valueY]) => base.map(
			valueX => {
				// isFinite is false for +Infinity, -Infinity and NaN
				if (Math.abs(valueX.value) === 1 && !Number.isFinite(valueY.value)) {
					return createAtomicValue(1, 'xs:double');
				}
				return createAtomicValue(Math.pow(valueX.value, valueY.value), 'xs:double');
			}));
}

function mathSqrt (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createAtomicValue(Math.sqrt(onlyValue.value), 'xs:double'));
}

function mathSin (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createAtomicValue(Math.sin(onlyValue.value), 'xs:double'));
}

function mathCos (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createAtomicValue(Math.cos(onlyValue.value), 'xs:double'));
}

function mathTan (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createAtomicValue(Math.tan(onlyValue.value), 'xs:double'));
}

function mathAsin (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createAtomicValue(Math.asin(onlyValue.value), 'xs:double'));
}

function mathAcos (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createAtomicValue(Math.acos(onlyValue.value), 'xs:double'));
}

function mathAtan (_dynamicContext, sequence) {
	return sequence.map(onlyValue => createAtomicValue(Math.atan(onlyValue.value), 'xs:double'));
}

function mathAtan2 (_dynamicContext, x, y) {
	// Note that x is the double? argument, y is double.
	return y.mapAll(([onlyYValue]) => x.map(onlyXValue => createAtomicValue(Math.atan2(onlyXValue.value, onlyYValue.value), 'xs:double')));
}

export default {
	declarations: [
		{
			name: 'math:pi',
			argumentTypes: [],
			returnType: 'xs:double',
			callFunction: mathPi
		},

		{
			name: 'math:exp',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathExp
		},

		{
			name: 'math:exp10',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathExp10
		},

		{
			name: 'math:log',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathLog
		},

		{
			name: 'math:log10',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathLog10
		},

		{
			name: 'math:pow',
			argumentTypes: ['xs:double?', 'xs:numeric'],
			returnType: 'xs:double?',
			callFunction: mathPow
		},

		{
			name: 'math:sqrt',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathSqrt
		},

		{
			name: 'math:sin',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathSin
		},

		{
			name: 'math:cos',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathCos
		},

		{
			name: 'math:tan',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathTan
		},

		{
			name: 'math:asin',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathAsin
		},

		{
			name: 'math:acos',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathAcos
		},

		{
			name: 'math:atan',
			argumentTypes: ['xs:double?'],
			returnType: 'xs:double?',
			callFunction: mathAtan
		},

		{
			name: 'math:atan2',
			argumentTypes: ['xs:double?', 'xs:double'],
			returnType: 'xs:double?',
			callFunction: mathAtan2
		}
	]
};
