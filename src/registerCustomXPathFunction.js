import adaptJavaScriptValueToXPathValue from './selectors/adaptJavaScriptValueToXPathValue';
import isSubtypeOf from './selectors/dataTypes/isSubtypeOf';
import functionRegistry from './selectors/functions/functionRegistry';
import {
	staticallyKnownNamespaceByPrefix,
	registerStaticallyKnownNamespace
} from './selectors/staticallyKnownNamespaces';

function adaptXPathValueToJavascriptValue (valueSequence, sequenceType) {
	switch (sequenceType[sequenceType.length - 1]) {
		case '?':
			if (valueSequence.isEmpty()) {
				return null;
			}
			return valueSequence.first().value;

		case '*':
		case '+':
			return valueSequence.getAllValues().map(function (value) {
				if (isSubtypeOf(value.type, 'attribute()')) {
					throw new Error('Cannot pass attribute nodes to custom functions');
				}
				return value.value;
			});

		default:
			return valueSequence.first().value;
	}
}

/**
* @param  {string|!{namespaceURI, localName}} name
* @return {!{namespaceURI: string, localName: string}}
*/
function splitFunctionName (name) {
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
		namespaceURI: namespaceURIForPrefix,
		localName: localName
	};
}

/**
 * Add a custom test for use in xpath-serialized selectors.
 *
 * @param   {string|!{namespaceURI, localName}}  name        The name of this custom function. The string overload is deprecated, please register functions using the object overload
 * @param   {Array<string>}  signature   The signature of the test, as array of strings (e.g. ['item()', 'node()?', 'xs:numeric'])
 * @param   {string}         returnType  The return type of the test, as sequence type (e.g. 'xs:boolean()')
 * @param   {function(*):*}  callback    The test itself, which gets the dynamicContext and arguments passed
 * @return  {undefined}
 */
export default function registerCustomXPathFunction (name, signature, returnType, callback) {
	const { namespaceURI, localName } = splitFunctionName(name);

	const callFunction = function (dynamicContext) {
			// Make arguments a read array instead of a array-like object
			const args = Array.from(arguments);

			args.splice(0, 1);

			const newArguments = args.map(function (argument, index) {
					return adaptXPathValueToJavascriptValue(argument, signature[index]);
				});

			// Adapt the domFacade into another object to prevent passing everything. The closure compiler might rename some variables otherwise.
			// Since the interface for domFacade (IDomFacade) is marked as extern, it will not be changed
			const dynamicContextAdapter = {};
			dynamicContextAdapter['domFacade'] = dynamicContext.domFacade;

			const jsResult = callback.apply(undefined, [dynamicContextAdapter].concat(newArguments));
			const xpathResult = adaptJavaScriptValueToXPathValue(jsResult, returnType);

			return xpathResult;
		};

	functionRegistry.registerFunction(namespaceURI, localName, signature, returnType, callFunction);
}
