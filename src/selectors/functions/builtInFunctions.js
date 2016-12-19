define([
	'./builtInFunctions.boolean',
	'./builtInFunctions.context',
	'./builtInFunctions.identifiers',
	'./builtInFunctions.node',
	'./builtInFunctions.numeric',
	'./builtInFunctions.operators',
	'./builtInFunctions.sequences',
	'./builtInFunctions.string'
], function (
	builtInBooleanunctions,
	builtInContextFunctions,
	builtInIdentifierFunctions,
	builtInNodeFunctions,
	builtInNumericFunctions,
	builtInOperatorFunctions,
	builtInSequencesFunctions,
	builtInStringFunctions
) {
	'use strict';

	return builtInStringFunctions.declarations
		.concat(builtInContextFunctions.declarations)
		.concat(builtInIdentifierFunctions.declarations)
		.concat(builtInBooleanunctions.declarations)
		.concat(builtInNodeFunctions.declarations)
		.concat(builtInNumericFunctions.declarations)
		.concat(builtInOperatorFunctions.declarations)
		.concat(builtInSequencesFunctions.declarations)
		.concat(builtInStringFunctions.declarations);
});
