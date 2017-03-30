import DoubleValue from '../dataTypes/DoubleValue';
import Sequence from '../dataTypes/Sequence';

function mathPi (_dynamicContext) {
	return Sequence.singleton(new DoubleValue(Math.PI));
}

function mathExp (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(new DoubleValue(Math.pow(Math.E, sequence.value[0].value)));
}

function mathExp10 (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(new DoubleValue(Math.pow(10, sequence.value[0].value)));
}

function mathLog (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(new DoubleValue(Math.log(sequence.value[0].value)));
}

function mathLog10 (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(new DoubleValue(Math.log10(sequence.value[0].value)));
}

function mathPow (_dynamicContext, sequence, y) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	var valueX = sequence.value[0].value,
		valueY = y.value[0].value;
	if ((valueX === 1 || valueX === -1) && (valueY === Infinity || valueY === -Infinity || isNaN(valueY))) {
		return Sequence.singleton(new DoubleValue(1));
	}

	return Sequence.singleton(new DoubleValue(Math.pow(sequence.value[0].value, y.value[0].value)));
}

function mathSqrt (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(new DoubleValue(Math.sqrt(sequence.value[0].value)));
}

function mathSin (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(new DoubleValue(Math.sin(sequence.value[0].value)));
}

function mathCos (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(new DoubleValue(Math.cos(sequence.value[0].value)));
}

function mathTan (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(new DoubleValue(Math.tan(sequence.value[0].value)));
}

function mathAsin (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(new DoubleValue(Math.asin(sequence.value[0].value)));
}

function mathAcos (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(new DoubleValue(Math.acos(sequence.value[0].value)));
}

function mathAtan (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(new DoubleValue(Math.atan(sequence.value[0].value)));
}

function mathAtan2 (_dynamicContext, sequence, x) {
	if (sequence.isEmpty()) {
		return sequence;
	}

	return Sequence.singleton(new DoubleValue(Math.atan2(sequence.value[0].value, x.value[0].value)));
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
