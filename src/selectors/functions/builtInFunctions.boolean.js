import BooleanValue from '../dataTypes/BooleanValue';
import Sequence from '../dataTypes/Sequence';
import { castToType } from '../dataTypes/conversionHelper';

function fnNot (_dynamicContext, sequence) {
	return Sequence.singleton(sequence.getEffectiveBooleanValue() ? BooleanValue.FALSE : BooleanValue.TRUE);
}

function fnBoolean (_dynamicContext, sequence) {
	return Sequence.singleton(sequence.getEffectiveBooleanValue() ? BooleanValue.TRUE : BooleanValue.FALSE);
}
function xsBoolean (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(castToType(sequence.first(), 'xs:boolean'));
}

function fnTrue () {
	return Sequence.singleton(BooleanValue.TRUE);
}

function fnFalse () {
	return Sequence.singleton(BooleanValue.FALSE);
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
			name: 'xs:boolean',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:boolean?',
			callFunction: xsBoolean
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
