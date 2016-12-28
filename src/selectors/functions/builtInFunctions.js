import builtInArrayFunctions from './builtInFunctions.arrays';
import builtInBooleanFunctions from './builtInFunctions.boolean';
import builtInContextFunctions from './builtInFunctions.context';
import builtInIdentifierFunctions from './builtInFunctions.identifiers';
import builtInJsonFunctions from './builtInFunctions.json';
import builtInNodeFunctions from './builtInFunctions.node';
import builtInNumericFunctions from './builtInFunctions.numeric';
import builtInOperatorFunctions from './builtInFunctions.operators';
import builtInSequencesFunctions from './builtInFunctions.sequences';
import builtInMapFunctions from './builtInFunctions.maps';
import builtInStringFunctions from './builtInFunctions.string';

export default builtInContextFunctions.declarations
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
