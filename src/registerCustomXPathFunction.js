define([
	'./selectors/adaptJavaScriptValueToXPathValue',
	'./selectors/functions/functionRegistry',
	'./selectors/functions/isValidArgument'
], function (
	adaptJavaScriptValueToXPathValue,
	functionRegistry,
	isValidArgument
) {
	'use strict';

	function adaptXPathValueToJavascriptValue (valueSequence, sequenceType) {
		if (valueSequence.instanceOfType('attribute()')) {
			throw new Error('Cannot pass attribute nodes to custom functions');
		}

		switch (sequenceType[sequenceType.length - 1]) {
			case '?':
				if (valueSequence.isEmpty()) {
					return null;
				}
				return valueSequence.value[0].value;

			case '*':
			case '+':
				return valueSequence.value.map(function (value) {
					return value.value;
				});

			default:
				return valueSequence.value[0].value;
		}
	}

	/**
	 * Add a custom test for use in xpath-serialized selectors.
	 *
	 * @param  {string}    name        The name of this test, starts with fonto:
	 * @param  {array}     signature   The signature of the test, as array of strings (e.g. ['item()', 'node()?', 'xs:numeric'])
	 * @param  {string}    returnType  The return type of the test, as sequence type (e.g. 'xs:boolean()')
	 * @param  {function}  callback    The test itself, which gets the dynamicContext and arguments passed
	 */
	return function registerCustomXPathFunction (name, signature, returnType, callback) {
		var callFunction = function (dynamicContext) {
				// Make arguments a read array instead of a array-like object
				var args = Array.from(arguments);

				args.splice(0, 1);

				var newArguments = args.map(function (argument, index) {
						return adaptXPathValueToJavascriptValue(argument, signature[index]);
					});

				var result = callback.apply(undefined, [dynamicContext].concat(newArguments));
				result = adaptJavaScriptValueToXPathValue(result, returnType);

				if (!isValidArgument(returnType, result)) {
					throw new Error('XPTY0004: Custom function (' + name + ') should return ' + returnType);
				}

				return result;
			};

		functionRegistry.registerFunction(name, signature, returnType, callFunction);
	};
});
