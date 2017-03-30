import builtInArrayFunctions from './builtInFunctions.arrays';
import builtInBooleanFunctions from './builtInFunctions.boolean';
import builtInContextFunctions from './builtInFunctions.context';
import builtInIdentifierFunctions from './builtInFunctions.identifiers';
import builtInJsonFunctions from './builtInFunctions.json';
import builtInMathFunctions from './builtInFunctions.math';
import builtInNodeFunctions from './builtInFunctions.node';
import builtInMapFunctions from './builtInFunctions.maps';
import builtInNumericFunctions from './builtInFunctions.numeric';
import builtInOperatorFunctions from './builtInFunctions.operators';
import builtInSequencesFunctions from './builtInFunctions.sequences';
import builtInStringFunctions from './builtInFunctions.string';

import Sequence from '../dataTypes/Sequence';
import DynamicContext from '../DynamicContext';

/**
 * @type {!Object<string, {name: string, argumentTypes: !Array<string>, returnType: string, callFunction: function (DynamicContext, ...!Sequence): !Sequence}>}
 */
export default [].concat(
	builtInArrayFunctions.declarations,
	builtInBooleanFunctions.declarations,
	builtInContextFunctions.declarations,
	builtInIdentifierFunctions.declarations,
	builtInJsonFunctions.declarations,
	builtInMathFunctions.declarations,
	builtInNodeFunctions.declarations,
	builtInMapFunctions.declarations,
	builtInNumericFunctions.declarations,
	builtInOperatorFunctions.declarations,
	builtInSequencesFunctions.declarations,
	builtInStringFunctions.declarations);
