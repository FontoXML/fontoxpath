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
		}
	],
	functions: {
		number: fnNumber
	}
};
