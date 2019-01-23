import { IAST } from './astHelper';
import { parse, SyntaxError } from './xPathParser';

const astParseResultCache = Object.create(null);

function storeParseResultInCache(input: string, language: string, ast: any) {
	astParseResultCache[`${language}~${input}`] = ast;
}

function getParseResultFromCache(input: string, language: string) {
	return astParseResultCache[`${language}~${input}`] || null;
}

/**
 * Parse an XPath string to a selector.
 *
 * @param  xPathString         The string to parse
 * @param  compilationOptions  Whether the compiler should parse XQuery
 */
export default function parseExpression(
	xPathString: string,
	compilationOptions: { allowXQuery?: boolean; debug?: boolean }
) {
	const language = compilationOptions.allowXQuery ? 'XQuery' : 'XPath';
	const cached = compilationOptions.debug ? null : getParseResultFromCache(xPathString, language);

	try {
		let ast: IAST;
		if (cached) {
			ast = cached;
		} else {
			ast = parse(xPathString, {
				['xquery']: !!compilationOptions.allowXQuery,
				['outputDebugInfo']: !!compilationOptions.debug
			});
			if (!compilationOptions.debug) {
				storeParseResultInCache(xPathString, language, ast);
			}
		}
		return ast;
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw new Error(
				`XPST0003: Unable to parse XPath: "${xPathString}".\n${
					error.message
				}\n${xPathString.slice(0, error['location']['start']['offset']) +
					'[Error is around here]' +
					xPathString.slice(error['location']['start']['offset'])}`
			);
		}
		throw error;
	}
}
