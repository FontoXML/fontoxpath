import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';

function fnNot (_dynamicContext, sequence) {
	return Sequence.singleton(createAtomicValue(!sequence.getEffectiveBooleanValue(), 'xs:boolean'));
}

function fnBoolean (_dynamicContext, sequence) {
	return Sequence.singleton(createAtomicValue(sequence.getEffectiveBooleanValue(), 'xs:boolean'));
}

function fnTrue () {
	return Sequence.singleton(createAtomicValue(true, 'xs:boolean'));
}

function fnFalse () {
	return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
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
