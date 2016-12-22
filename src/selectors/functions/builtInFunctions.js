define([
	'./builtInFunctions.arrays',
	'./builtInFunctions.boolean',
	'./builtInFunctions.context',
	'./builtInFunctions.identifiers',
	'./builtInFunctions.json',
	'./builtInFunctions.node',
	'./builtInFunctions.numeric',
	'./builtInFunctions.operators',
	'./builtInFunctions.sequences',
	'./builtInFunctions.maps',
	'./builtInFunctions.string'
], function (
	builtInArrayFunctions,
	builtInBooleanFunctions,
	builtInContextFunctions,
	builtInIdentifierFunctions,
	builtInJsonFunctions,
	builtInNodeFunctions,
	builtInNumericFunctions,
	builtInOperatorFunctions,
	builtInSequencesFunctions,
	builtInMapFunctions,
	builtInStringFunctions
) {
	'use strict';

	return builtInContextFunctions.declarations
		.concat(builtInArrayFunctions.declarations)
		.concat(builtInIdentifierFunctions.declarations)
		.concat(builtInJsonFunctions.declarations)
		.concat(builtInBooleanFunctions.declarations)
		.concat(builtInNodeFunctions.declarations)
		.concat(builtInNumericFunctions.declarations)
		.concat(builtInOperatorFunctions.declarations)
		.concat(builtInSequencesFunctions.declarations)
		.concat(builtInMapFunctions.declarations)
		.concat(builtInStringFunctions.declarations);
});
