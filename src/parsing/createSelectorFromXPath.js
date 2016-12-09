define([
	'../deprecation/warnForUsingDeprecatedFeature',
	'./xPathParser',
	'./compileAstToSelector',
	'./compiledSelectorCache'
], function (
	warnForUsingDeprecatedFeature,
	xPathParser,
	compileAstToSelector,
	compiledSelectorCache
) {
	'use strict';

	/**
	 * Parse an XPath string to a selector.
	 *
	 * @param  {string}  xPathString      The string to parse
	 */
	return function parseSelector (xPathString) {
		if (!compiledSelectorCache[xPathString]) {
			try {
				var ast = xPathParser.parse(xPathString);
				var compilerResult = compileAstToSelector(ast);
				compiledSelectorCache[xPathString] = compilerResult.result;

				if (compilerResult.hasDeprecationWarnings) {
					warnForUsingDeprecatedFeature('Functions as tests (like self::XXX()) are not correct XPath. They will be removed next release. Please refactor the selector "' + xPathString + '"');
				}
			} catch (error) {
				if (error instanceof xPathParser.SyntaxError) {
					throw new Error('XPST0003: Unable to parse XPath: ' + xPathString + '. ' + error);
				}
				throw error;
			}
		}
		return compiledSelectorCache[xPathString];
	};
});
