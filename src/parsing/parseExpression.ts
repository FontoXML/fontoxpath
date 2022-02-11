import { IAST } from './astHelper';
import { parseUsingPrsc } from './prscParser';

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
): IAST {
	const language = compilationOptions.allowXQuery ? 'XQuery' : 'XPath';
	const cached = compilationOptions.debug ? null : getParseResultFromCache(xPathString, language);

	let ast: IAST;
	if (cached) {
		ast = cached;
	} else {
		const options = {
			xquery: !!compilationOptions.allowXQuery,
			outputDebugInfo: !!compilationOptions.debug,
		};

		const parseResult = parseUsingPrsc(xPathString, options);
		if (parseResult.success === true) {
			ast = parseResult.value;
		} else {
			throw new Error(
				`XPST0003: Failed to parse '${xPathString}' expected: ${parseResult.expected}\n${xPathString.slice(0, parseResult.offset) +
				'[Error is around here]' +
				xPathString.slice(parseResult.offset)
				}`
			);
		}

		if (!compilationOptions.debug) {
			storeParseResultInCache(xPathString, language, ast);
		}
	}

	return ast;
}
