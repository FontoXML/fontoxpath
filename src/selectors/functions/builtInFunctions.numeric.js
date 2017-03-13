import DoubleValue from '../dataTypes/DoubleValue';
import Sequence from '../dataTypes/Sequence';
import { castToType } from '../dataTypes/conversionHelper';

function contextItemAsFirstArgument (fn, dynamicContext) {
	return fn(dynamicContext, dynamicContext.contextItem);
}

function fnNumber (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return Sequence.singleton(new DoubleValue(NaN));
	}
	return Sequence.singleton(castToType(sequence.value[0], 'xs:double'));
}

function xsFloat (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(castToType(sequence.value[0], 'xs:float'));
}

function xsInteger (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(castToType(sequence.value[0], 'xs:integer'));
}

function xsDouble (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(castToType(sequence.value[0], 'xs:double'));
}

export default {
	declarations: [
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
			callFunction: contextItemAsFirstArgument.bind(null, fnNumber)
		},

		{
			name: 'xs:float',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:float?',
			callFunction: xsFloat
		},

		{
			name: 'xs:integer',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:integer?',
			callFunction: xsFloat
		},

		{
			name: 'xs:double',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:double?',
			callFunction: xsFloat
		}
	],
	functions: {
		number: fnNumber
	}
};
