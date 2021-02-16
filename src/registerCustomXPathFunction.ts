import IDomFacade from './domFacade/IDomFacade';
import { ResolvedQualifiedName } from './evaluateXPath';
import { adaptJavaScriptValueToSequence } from './expressions/adaptJavaScriptValueToXPathValue';
import { FunctionSignature } from './expressions/dataTypes/FunctionValue';
import ISequence from './expressions/dataTypes/ISequence';
import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import sequenceFactory from './expressions/dataTypes/sequenceFactory';
import { ValueType } from './expressions/dataTypes/Value';
import DynamicContext from './expressions/DynamicContext';
import ExecutionParameters from './expressions/ExecutionParameters';
import { registerFunction } from './expressions/functions/functionRegistry';
import {
	registerStaticallyKnownNamespace,
	staticallyKnownNamespaceByPrefix,
} from './expressions/staticallyKnownNamespaces';
import StaticContext from './expressions/StaticContext';
import { IterationHint } from './expressions/util/iterators';
import { errXQST0060 } from './expressions/xquery/XQueryErrors';
import transformXPathItemToJavascriptObject from './transformXPathItemToJavascriptObject';
import {
	IS_XPATH_VALUE_SYMBOL,
	TypedExternalValue,
	UntypedExternalValue,
} from './types/createTypedValueFactory';

type DynamicContextAdapter = {
	currentContext: any;
	domFacade: IDomFacade;
};

function adaptXPathValueToJavascriptValue(
	valueSequence: ISequence,
	sequenceType: string,
	executionParameters: ExecutionParameters
): any | null | any[] {
	switch (sequenceType[sequenceType.length - 1]) {
		case '?':
			if (valueSequence.isEmpty()) {
				return null;
			}
			return transformXPathItemToJavascriptObject(
				valueSequence.first(),
				executionParameters
			).next(IterationHint.NONE).value;

		case '*':
		case '+':
			return valueSequence.getAllValues().map((value) => {
				if (isSubtypeOf(value.type, 'attribute()')) {
					throw new Error('Cannot pass attribute nodes to custom functions');
				}
				return transformXPathItemToJavascriptObject(value, executionParameters).next(
					IterationHint.NONE
				).value;
			});

		default:
			return transformXPathItemToJavascriptObject(
				valueSequence.first(),
				executionParameters
			).next(IterationHint.NONE).value;
	}
}

function splitFunctionName(
	name: string | { localName: string; namespaceURI: string }
): { localName: string; namespaceURI: string } {
	if (typeof name === 'object') {
		return name;
	}
	const parts = name.split(':');
	if (parts.length !== 2) {
		throw new Error('Do not register custom functions in the default function namespace');
	}

	const [prefix, localName] = parts;
	let namespaceURIForPrefix = staticallyKnownNamespaceByPrefix[prefix];
	if (!namespaceURIForPrefix) {
		namespaceURIForPrefix = `generated_namespace_uri_${prefix}`;
		registerStaticallyKnownNamespace(prefix, namespaceURIForPrefix);
	}

	// Register this prefix to a random namespace uri
	return {
		localName,
		namespaceURI: namespaceURIForPrefix,
	};
}

/**
 * The definition of an external function. Called with however many arguments the original arity was
 *
 * @public
 */
export type ExternalFunctionDefinition = {
	callback: ExternalFunctionCall;
	name: ResolvedQualifiedName;
	returnType: string;
	signature: string[];
};

/**
 * @public
 */
export type ExternalFunctionCall = (
	domFacade: { currentContext: any; domFacade: IDomFacade },
	...functionArgs: any[]
) => TypedExternalValue | UntypedExternalValue;

export function transformExternalFunction(
	externalFunctionDefinition: ExternalFunctionDefinition
): FunctionSignature<ISequence> {
	return (
		_dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters,
		_staticContext: StaticContext,
		...args: ISequence[]
	) => {
		const newArguments = args.map((argument, index) => {
			return adaptXPathValueToJavascriptValue(
				argument,
				externalFunctionDefinition.signature[index],
				executionParameters
			);
		});

		// Adapt the domFacade into another object to prevent passing everything. The closure compiler might rename some variables otherwise.
		// Since the interface for domFacade (IDomFacade) is marked as extern, it will not be changed
		const dynamicContextAdapter: DynamicContextAdapter = {
			['currentContext']: executionParameters.currentContext,
			['domFacade']: executionParameters.domFacade.unwrap(),
		};

		const jsResult = externalFunctionDefinition.callback.apply(undefined, [
			dynamicContextAdapter,
			...newArguments,
		]);

		if (jsResult && typeof jsResult === 'object' && IS_XPATH_VALUE_SYMBOL in jsResult) {
			// If this symbol is present, the value has already undergone type conversion.
			const castedObject = jsResult as TypedExternalValue;
			return sequenceFactory.create(castedObject.convertedValue);
		}

		// The value is not converted yet. Do it just in time.
		const xpathResult = adaptJavaScriptValueToSequence(
			executionParameters.domFacade,
			jsResult,
			externalFunctionDefinition.returnType
		);

		return xpathResult;
	};
}

/**
 * Add a custom test for use in xpath-serialized expressions.
 *
 * @public
 *
 * @param  name - The name of this custom function. The string overload is deprecated, please register functions using the object overload
 * @param  signature - The signature of the test, as array of strings (e.g. ['item()', 'node()?', 'xs:numeric'])
 * @param  returnType - The return type of the test, as sequence type (e.g. 'xs:boolean()')
 * @param  callback - The test itself, which gets the dynamicContext and arguments passed
 */
export default function registerCustomXPathFunction(
	name: string | ResolvedQualifiedName,
	signature: ValueType[],
	returnType: ValueType,
	callback: ExternalFunctionCall
): void {
	const { namespaceURI, localName } = splitFunctionName(name);

	if (!namespaceURI) {
		throw errXQST0060();
	}

	const callFunction = transformExternalFunction({
		callback,
		name: { namespaceURI, localName },
		returnType,
		signature,
	});

	registerFunction(namespaceURI, localName, signature, returnType, callFunction);
}
