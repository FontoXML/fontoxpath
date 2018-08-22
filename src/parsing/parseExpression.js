import { parse, SyntaxError } from './xPathParser';

/**
 * @dict
 */
const astParseResultCache = Object.create(null);

function storeParseResultInCache (string, language, ast) {
	astParseResultCache[`${language}~${string}`] = ast;
}

function getParseResultFromCache (string, language) {
	return astParseResultCache[`${language}~${string}`] || null;
}

/**
 * Parse an XPath string to a selector.
 *
 * @param  {string}                  xPathString         The string to parse
 * @param  {{allowXQuery: boolean}}  compilationOptions  Whether the compiler should parse XQuery
 */
export default function parseExpression (xPathString, compilationOptions) {
	const language = compilationOptions.allowXQuery ? 'XQuery' : 'XPath';
	const cached = getParseResultFromCache(xPathString, language);

	try {
		let ast;
		if (cached) {
			ast = cached;
		} else {
			// We are absolutely not interested in XQuery modules here
			ast = parse(xPathString, { 'startRule': 'Module' });
			storeParseResultInCache(xPathString, language, ast);
		}
		return ast;
	}
	catch (error) {
		if (error instanceof SyntaxError) {
			throw new Error(
				`XPST0003: Unable to parse XPath: "${xPathString}".\n${error.message}\n${xPathString.slice(0, error['location']['start']['offset']) + '[Error is around here]' + xPathString.slice(error['location']['start']['offset'])}`);
		}
		throw error;
	}
}
