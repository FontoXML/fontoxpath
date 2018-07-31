import { parse, SyntaxError } from './xPathParser';
import compileAstToSelector from './compileAstToSelector';

/**
 * @dict
 */
const astParseResultCache = Object.create(null);

export function storeParseResultInCache (string, language, ast) {
	astParseResultCache[`${language}~${string}`] = ast;
}

export function getParseResultFromCache (string, language) {
	return astParseResultCache[`${language}~${string}`] || null;
}

/**
 * Parse an XPath string to a selector.
 *
 * @param  {string}                  xPathString         The string to parse
 * @param  {{allowXQuery: boolean}}  compilationOptions  Whether the compiler should parse XQuery
 * @return {!../selectors/Selector}
 */
export default function parseSelector (xPathString, compilationOptions) {
	const language = compilationOptions.allowXQuery ? 'XQuery' : 'XPath';
	const cached = getParseResultFromCache(xPathString, language);

	try {
		let ast;
		if (cached) {
			ast = cached;
		} else {
			ast = parse(xPathString);
			storeParseResultInCache(xPathString, language, ast);
		}

		return compileAstToSelector(ast, compilationOptions);
	}
	catch (error) {
		if (error instanceof SyntaxError) {
			throw new Error('XPST0003: Unable to parse XPath: ' + xPathString + '. ' + error);
		}
		throw error;
	}
}
