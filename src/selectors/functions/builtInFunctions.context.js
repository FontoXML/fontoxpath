import IntegerValue from '../dataTypes/IntegerValue';
import Sequence from '../dataTypes/Sequence';

function fnLast (dynamicContext) {
	return Sequence.singleton(new IntegerValue(dynamicContext.contextSequence.value.length));
}

function fnPosition (dynamicContext) {
	// Note: +1 because XPath is one-based
	return Sequence.singleton(new IntegerValue(dynamicContext.contextItemIndex + 1));
}

export default {
	declarations: [
		{
			name: 'last',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: fnLast,
			optimizationOptions: {
				usesContextLength: true
			}
		},

		{
			name: 'position',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: fnPosition
		}
	],
	functions: {
		last: fnLast,
		position: fnPosition
	}
};
