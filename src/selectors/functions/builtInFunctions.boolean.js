import Sequence from '../dataTypes/Sequence';

function fnNot (_dynamicContext, sequence) {
	return !sequence.getEffectiveBooleanValue() ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();;
}

function fnBoolean (_dynamicContext, sequence) {
	return sequence.getEffectiveBooleanValue() ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();;
}

function fnTrue () {
	return Sequence.singletonTrueSequence();
}

function fnFalse () {
	return Sequence.singletonFalseSequence();
}

export default {
	declarations: [
		{
			name: 'boolean',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnBoolean
		},

		{
			name: 'true',
			argumentTypes: [],
			returnType: 'xs:boolean',
			callFunction: fnTrue
		},

		{
			name: 'not',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnNot
		},

		{
			name: 'false',
			argumentTypes: [],
			returnType: 'xs:boolean',
			callFunction: fnFalse
		}
	],
	functions: {
		boolean: fnBoolean,
		true: fnTrue,
		false: fnFalse,
		not: fnNot
	}
};
