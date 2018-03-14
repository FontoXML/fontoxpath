import { parse, SyntaxError } from './xPathParser';
import compileAstToSelector from './compileAstToSelector';
import compiledSelectorCache from './compiledSelectorCache';

/**
 * Parse an XPath string to a selector.
 *
 * @param  {string}                  xPathString         The string to parse
 * @param  {{allowXQuery: boolean}}  compilationOptions  Whether the compiler should parse XQuery
 * @return {!../selectors/Selector}
 */
export default function parseSelector (xPathString, compilationOptions) {
	var cacheKey = compilationOptions.allowXQuery ?
		`XQuery_${xPathString}` :
		`XPath_${xPathString}`;
	if (!compiledSelectorCache[cacheKey]) {
		try {
			var ast = parse(xPathString);
			var compilerResult = compileAstToSelector(ast, compilationOptions);
			compiledSelectorCache[cacheKey] = compilerResult;
		}
		catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error('XPST0003: Unable to parse XPath: ' + xPathString + '. ' + error);
			}
			throw error;
		}
	}
	return compiledSelectorCache[cacheKey];
}
