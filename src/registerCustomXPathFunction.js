import adaptJavaScriptValueToXPathValue from './selectors/adaptJavaScriptValueToXPathValue';
import isSubtypeOf from './selectors/dataTypes/isSubtypeOf';
import functionRegistry from './selectors/functions/functionRegistry';

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
 * Add a custom test for use in xpath-serialized selectors.
 *
 * @param  {string}         name        The name of this test, starts with fonto:
 * @param  {Array<string>}  signature   The signature of the test, as array of strings (e.g. ['item()', 'node()?', 'xs:numeric'])
 * @param  {string}         returnType  The return type of the test, as sequence type (e.g. 'xs:boolean()')
 * @param  {function(*):*}  callback    The test itself, which gets the dynamicContext and arguments passed
 * @return {undefined}
 */
export default function registerCustomXPathFunction (name, signature, returnType, callback) {
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

	functionRegistry.registerFunction(name, signature, returnType, callFunction);
}
