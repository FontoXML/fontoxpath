import DoubleValue from '../dataTypes/DoubleValue';
import Sequence from '../dataTypes/Sequence';

function contextItemAsFirstArgument (fn, dynamicContext) {
	return fn(dynamicContext, dynamicContext.contextItem);
}

function fnNumber (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return Sequence.singleton(new DoubleValue(NaN));
	}
	return Sequence.singleton(DoubleValue.cast(sequence.value[0]));
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
			callFunction: contextItemAsFirstArgument.bind(undefined, fnNumber)
		}
	],
	functions: {
		number: fnNumber
	}
};
