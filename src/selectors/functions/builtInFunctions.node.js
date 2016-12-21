define([
	'./builtInFunctions.string',
	'../dataTypes/QNameValue',
	'../dataTypes/Sequence'
], function (
	builtinStringFunctions,
	QNameValue,
	Sequence
) {
	'use strict';

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

	function fnNodeName (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return sequence;
		}
		var nodeName = sequence.value[0].nodeName;
		if (nodeName === null) {
			return Sequence.empty();
		}
		return Sequence.singleton(new QNameValue(nodeName));
	}

	return {
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
				callFunction: contextItemAsFirstArgument.bind(undefined, fnName)
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
				callFunction: contextItemAsFirstArgument.bind(undefined, fnNodeName)
			},
		],
		functions: {
			name: fnName,
			nodeName: fnNodeName
		}
	};
});
