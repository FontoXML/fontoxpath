import DomFacade from '../domFacade/DomFacade';
import IDomFacade from '../domFacade/IDomFacade';
import { adaptJavaScriptValueToSequence } from '../expressions/adaptJavaScriptValueToXPathValue';
import sequenceFactory from '../expressions/dataTypes/sequenceFactory';
import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import DynamicContext from '../expressions/DynamicContext';
import ExecutionParameters from '../expressions/ExecutionParameters';
import { getFunctionByArity } from '../expressions/functions/functionRegistry';
import { errXPDY0002 } from '../expressions/XPathErrors';
import { adaptXPathValueToJavascriptValue } from '../registerCustomXPathFunction';
import { UntypedExternalValue } from '../types/createTypedValueFactory';
import { Options } from '../types/Options';

// Make sure Closure Compiler does not change property names.
declare interface IRuntimeLib {
	callFunction: (
		domFacade: IDomFacade,
		namespaceURI: string,
		localName: string,
		args: UntypedExternalValue[],
		options: Options | null
	) => unknown;
	errXPDY0002: typeof errXPDY0002;
}

const runtimeLib: IRuntimeLib = {
	callFunction(domFacade, namespaceURI, localName, args, options): unknown {
		const functionProperties = getFunctionByArity(namespaceURI, localName, args.length);
		if (!functionProperties) {
			throw new Error('function not found for codegen function call');
		}
		// TODO: pass context item if the function uses it - can we annotate them?
		// (custom functions and functions on allow list don't currently use this)
		const dynamicContext = new DynamicContext({
			contextItem: null,
			contextItemIndex: 0,
			contextSequence: sequenceFactory.empty(),
			variableBindings: {},
		});
		const wrappedDomFacade = new DomFacade(domFacade);
		const currentContext = options ? options['currentContext'] : null;
		const executionParameters = new ExecutionParameters(
			false,
			false,
			wrappedDomFacade,
			null,
			null,
			currentContext,
			null
		);
		const ret = functionProperties.callFunction(
			dynamicContext,
			executionParameters,
			null,
			// Assume types are pre-checked and converted by the calling codegen code - any type
			// checking should happen during codegen. Sequences > 1 are not supported.
			...args.map((v, i) =>
				adaptJavaScriptValueToSequence(
					wrappedDomFacade,
					v,
					functionProperties.argumentTypes[i] as SequenceType
				)
			)
		);
		return adaptXPathValueToJavascriptValue(
			ret,
			{
				type: ValueType.ITEM,
				mult: SequenceMultiplicity.ZERO_OR_ONE,
			},
			executionParameters
		);
	},
	errXPDY0002,
};

export default runtimeLib;
