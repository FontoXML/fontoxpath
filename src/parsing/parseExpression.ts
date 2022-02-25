import { IAST } from './astHelper';
import { parseUsingPrsc } from './prscParser';

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
	const options = {
		xquery: !!compilationOptions.allowXQuery,
		outputDebugInfo: !!compilationOptions.debug,
	};

	const parseResult = parseUsingPrsc(xPathString, options);
	if (parseResult.success === true) {
		return parseResult.value;
	}

	throw new Error(
		`XPST0003: Failed to parse '${xPathString}' expected: ${parseResult.expected}\n${
			xPathString.slice(0, parseResult.offset) +
			'[Error is around here]' +
			xPathString.slice(parseResult.offset)
		}`
	);
}
