import { parse, SyntaxError } from './xPathParser';
import Selector from '../selectors/Selector';
import compileAstToSelector from './compileAstToSelector';
import compiledSelectorCache from './compiledSelectorCache';

/**
 * Parse an XPath string to a selector.
 *
 * @param  {string}  xPathString      The string to parse
 * @return {!Selector}
 */
export default function parseSelector (xPathString) {
	if (!compiledSelectorCache[xPathString]) {
		try {
			var ast = parse(xPathString);
			var compilerResult = compileAstToSelector(ast);
			compiledSelectorCache[xPathString] = compilerResult;
		}
		catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error('XPST0003: Unable to parse XPath: ' + xPathString + '. ' + error);
			}
			throw error;
		}
	}
	return compiledSelectorCache[xPathString];
}
