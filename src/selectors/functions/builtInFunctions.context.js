import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';

function fnLast (dynamicContext) {
	return Sequence.singleton(createAtomicValue(dynamicContext.contextSequence.getLength(), 'xs:integer'));
}

function fnPosition (dynamicContext) {
	// Note: +1 because XPath is one-based
	return Sequence.singleton(createAtomicValue(dynamicContext.contextItemIndex + 1, 'xs:integer'));
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
