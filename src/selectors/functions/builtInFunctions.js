define([
	'./builtInFunctions.boolean',
	'./builtInFunctions.context',
	'./builtInFunctions.identifiers',
	'./builtInFunctions.node',
	'./builtInFunctions.numeric',
	'./builtInFunctions.operators',
	'./builtInFunctions.sequences',
	'./builtInFunctions.maps',
	'./builtInFunctions.string'
], function (
	builtInBooleanunctions,
	builtInContextFunctions,
	builtInIdentifierFunctions,
	builtInNodeFunctions,
	builtInNumericFunctions,
	builtInOperatorFunctions,
	builtInSequencesFunctions,
	builtInMapFunctions,
	builtInStringFunctions
) {
	'use strict';

	return builtInContextFunctions.declarations
		.concat(builtInIdentifierFunctions.declarations)
		.concat(builtInBooleanunctions.declarations)
		.concat(builtInNodeFunctions.declarations)
		.concat(builtInNumericFunctions.declarations)
		.concat(builtInOperatorFunctions.declarations)
		.concat(builtInSequencesFunctions.declarations)
		.concat(builtInMapFunctions.declarations)
		.concat(builtInStringFunctions.declarations);
});
