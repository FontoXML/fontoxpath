import IntegerValue from '../dataTypes/IntegerValue';
import Sequence from '../dataTypes/Sequence';

function fnLast (dynamicContext) {
	return Sequence.singleton(new IntegerValue(dynamicContext.contextSequence.value.length));
}

function fnPosition (dynamicContext) {
	// Note: +1 because XPath is one-based
	return Sequence.singleton(new IntegerValue(dynamicContext.contextSequence.value.indexOf(dynamicContext.contextItem.value[0]) + 1));
}

export default {
	declarations: [
		{
			name: 'last',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: fnLast
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
