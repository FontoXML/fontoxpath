define([
	'./xPathParser',
	'./compileAstToSelector',
	'./compiledSelectorCache'
], function (
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
				compiledSelectorCache[xPathString] = compileAstToSelector(ast);
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
