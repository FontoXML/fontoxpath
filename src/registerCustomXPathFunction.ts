import adaptJavaScriptValueToXPathValue from './expressions/adaptJavaScriptValueToXPathValue';
import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import { registerFunction } from './expressions/functions/functionRegistry';

import IDomFacade from './domFacade/IDomFacade';
import ISequence from './expressions/dataTypes/ISequence';
import DynamicContext from './expressions/DynamicContext';
import ExecutionParameters from './expressions/ExecutionParameters';
import {
	registerStaticallyKnownNamespace,
	staticallyKnownNamespaceByPrefix
} from './expressions/staticallyKnownNamespaces';

type DomFacadeWrapper = {
	domFacade: IDomFacade;
};

function adaptXPathValueToJavascriptValue(
	valueSequence: ISequence,
	sequenceType: string
): any | null | any[] {
	switch (sequenceType[sequenceType.length - 1]) {
		case '?':
			if (valueSequence.isEmpty()) {
				return null;
			}
			return valueSequence.first()!.value;

		case '*':
		case '+':
			return valueSequence.getAllValues().map(function(value) {
				if (isSubtypeOf(value.type, 'attribute()')) {
					throw new Error('Cannot pass attribute nodes to custom functions');
				}
				return value.value;
			});

		default:
			return valueSequence.first()!.value;
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
		namespaceURI: namespaceURIForPrefix
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
	name: string | { localName: string; namespaceURI: string },
	signature: string[],
	returnType: string,
	callback: (domFacade: { domFacade: IDomFacade }, ...functionArgs: any[]) => any
): void {
	const { namespaceURI, localName } = splitFunctionName(name);

	const callFunction = function(
		_dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters,
		_staticContext: any
	) {
		// Make arguments a read array instead of a array-like object
		const args = Array.from(arguments);

		args.splice(0, 3);

		const newArguments = args.map(function(argument, index) {
			return adaptXPathValueToJavascriptValue(argument, signature[index]);
		});

		// Adapt the domFacade into another object to prevent passing everything. The closure compiler might rename some variables otherwise.
		// Since the interface for domFacade (IDomFacade) is marked as extern, it will not be changed
		const dynamicContextAdapter: DomFacadeWrapper = {
			['domFacade']: executionParameters.domFacade.unwrap()
		};

		const jsResult = callback.apply(undefined, [dynamicContextAdapter, ...newArguments]);
		const xpathResult = adaptJavaScriptValueToXPathValue(jsResult, returnType);

		return xpathResult;
	};

	registerFunction(namespaceURI, localName, signature, returnType, callFunction);
}
