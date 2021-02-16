import { ValueType } from '../dataTypes/Value';
import builtInArrayFunctions from './builtInFunctions_arrays';
import builtInBooleanFunctions from './builtInFunctions_boolean';
import builtInContextFunctions from './builtInFunctions_context';
import builtInDataTypeConstructors from './builtInFunctions_dataTypeConstructors';
import builtInDatetimeFunctions from './builtInFunctions_datetime';
import builtInDebuggingFunctions from './builtInFunctions_debugging';
import builtInDurationFunctions from './builtInFunctions_duration';
import builtInFontoxpathFunctions from './builtInFunctions_fontoxpath';
import builtInFunctionsFunctions from './builtInFunctions_functions';
import builtInIdentifierFunctions from './builtInFunctions_identifiers';
import builtInJsonFunctions from './builtInFunctions_json';
import builtInMapFunctions from './builtInFunctions_maps';
import builtInMathFunctions from './builtInFunctions_math';
import builtInNodeFunctions from './builtInFunctions_node';
import builtInNumericFunctions from './builtInFunctions_numeric';
import builtInOperatorFunctions from './builtInFunctions_operators';
import builtInQNameFunctions from './builtInFunctions_qnames';
import builtInSequencesFunctions from './builtInFunctions_sequences';
import builtInStringFunctions from './builtInFunctions_string';
import FunctionDefinitionType from './FunctionDefinitionType';

const builtInFunctions: {
	argumentTypes: ValueType[];
	callFunction: FunctionDefinitionType;
	localName: string;
	namespaceURI: string;
	returnType: ValueType;
}[] = [].concat(
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
	builtInFontoxpathFunctions.declarations,
	builtInFunctionsFunctions.declarations
);

export default builtInFunctions;
