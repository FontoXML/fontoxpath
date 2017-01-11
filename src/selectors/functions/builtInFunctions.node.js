import builtinStringFunctions from './builtInFunctions.string';
import QNameValue from '../dataTypes/QNameValue';
import Sequence from '../dataTypes/Sequence';

var stringFunctions = builtinStringFunctions.functions;
function contextItemAsFirstArgument (fn, dynamicContext) {
	return fn(dynamicContext, dynamicContext.contextItem);
}

function fnName (dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return stringFunctions.string(dynamicContext, fnNodeName(dynamicContext, sequence));
}

function fnNodeName (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	var nodeName = sequence.value[0].nodeName;
	if (nodeName === null) {
		return Sequence.empty();
	}
	return Sequence.singleton(new QNameValue(nodeName));
}

export default {
	declarations: [
		{
			name: 'name',
			argumentTypes: ['node()?'],
			returnType: 'xs:string',
			callFunction: fnName
		},

		{
			name: 'name',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: contextItemAsFirstArgument.bind(null, fnName)
		},

		{
			name: 'node-name',
			argumentTypes: ['node()?'],
			returnType: 'xs:QName?',
			callFunction: fnNodeName
		},

		{
			name: 'node-name',
			argumentTypes: [],
			returnType: 'xs:QName?',
			callFunction: contextItemAsFirstArgument.bind(null, fnNodeName)
		},
	],
	functions: {
		name: fnName,
		nodeName: fnNodeName
	}
};
