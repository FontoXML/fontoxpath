import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';


function mathPi (_dynamicContext) {
	return Sequence.singleton(createAtomicValue(Math.PI, 'xs:double'));
}

function mathExp (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(createAtomicValue(Math.pow(Math.E, sequence.first().value), 'xs:double'));
}

function mathExp10 (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(createAtomicValue(Math.pow(10, sequence.first().value), 'xs:double'));
}

function mathLog (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(createAtomicValue(Math.log(sequence.first().value), 'xs:double'));
}

function mathLog10 (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(createAtomicValue(Math.log10(sequence.first().value), 'xs:double'));
}

function mathPow (_dynamicContext, sequence, y) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	var valueX = sequence.first().value,
		valueY = y.first().value;
	if ((valueX === 1 || valueX === -1) && (valueY === Infinity || valueY === -Infinity || isNaN(valueY))) {
		return Sequence.singleton(createAtomicValue(1, 'xs:double'));
	}

	return Sequence.singleton(createAtomicValue(Math.pow(sequence.first().value, y.first().value), 'xs:double'));
}

function mathSqrt (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(createAtomicValue(Math.sqrt(sequence.first().value), 'xs:double'));
}

function mathSin (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(createAtomicValue(Math.sin(sequence.first().value), 'xs:double'));
}

function mathCos (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(createAtomicValue(Math.cos(sequence.first().value), 'xs:double'));
}

function mathTan (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(createAtomicValue(Math.tan(sequence.first().value), 'xs:double'));
}

function mathAsin (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(createAtomicValue(Math.asin(sequence.first().value), 'xs:double'));
}

function mathAcos (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(createAtomicValue(Math.acos(sequence.first().value), 'xs:double'));
}

function mathAtan (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(createAtomicValue(Math.atan(sequence.first().value), 'xs:double'));
}

function mathAtan2 (_dynamicContext, sequence, x) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(createAtomicValue(Math.atan2(sequence.first().value, x.first().value), 'xs:double'));
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
