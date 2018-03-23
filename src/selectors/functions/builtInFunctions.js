import builtInArrayFunctions from './builtInFunctions.arrays';
import builtInBooleanFunctions from './builtInFunctions.boolean';
import builtInContextFunctions from './builtInFunctions.context';
import builtInDataTypeConstructors from './builtInFunctions.dataTypeConstructors';
import builtInDatetimeFunctions from './builtInFunctions.datetime';
import builtInDebuggingFunctions from './builtInFunctions.debugging';
import builtInDurationFunctions from './builtInFunctions.duration';
import builtInIdentifierFunctions from './builtInFunctions.identifiers';
import builtInJsonFunctions from './builtInFunctions.json';
import builtInMapFunctions from './builtInFunctions.maps';
import builtInMathFunctions from './builtInFunctions.math';
import builtInNodeFunctions from './builtInFunctions.node';
import builtInNumericFunctions from './builtInFunctions.numeric';
import builtInOperatorFunctions from './builtInFunctions.operators';
import builtInQNameFunctions from './builtInFunctions.qnames';
import builtInSequencesFunctions from './builtInFunctions.sequences';
import builtInStringFunctions from './builtInFunctions.string';

import builtInFontoxpathFunctions from './builtInFunctions.fontoxpath';

import Sequence from '../dataTypes/Sequence';
import DynamicContext from '../DynamicContext';

/**
 * @type {!Array<!{localName: string, namespaceURI: string, argumentTypes: !Array<string>, returnType: string, callFunction: function (DynamicContext, ...!Sequence): !Sequence}>}
 */
const builtInFunctions = [].concat(
	builtInArrayFunctions.declarations,
	builtInBooleanFunctions.declarations,
	builtInContextFunctions.declarations,
	builtInDataTypeConstructors.declarations,
	builtInDatetimeFunctions.declarations,
	builtInDebuggingFunctions.declarations,
	builtInDurationFunctions.declarations,
	builtInIdentifierFunctions.declarations,
	builtInJsonFunctions.declarations,
	builtInMapFunctions.declarations,
	builtInMathFunctions.declarations,
	builtInNodeFunctions.declarations,
	builtInNumericFunctions.declarations,
	builtInOperatorFunctions.declarations,
	builtInQNameFunctions.declarations,
	builtInSequencesFunctions.declarations,
	builtInStringFunctions.declarations,
	builtInFontoxpathFunctions.declarations);

export default builtInFunctions;
