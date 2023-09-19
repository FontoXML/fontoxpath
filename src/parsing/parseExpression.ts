import { Location } from 'src/expressions/debug/StackTraceGenerator';
import { StackTraceEntry } from '../expressions/debug/StackTraceEntry';
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
	const lines = xPathString.substring(0, parseResult.offset).split('\n');
	const line = lines[lines.length - 1];
	// The offset is the last known position where the parser was OK, so the error is one over
	const column = line.length + 1;

	const positionS: Location = { offset: parseResult.offset, line: lines.length, column };
	const positionE: Location = {
		offset: parseResult.offset + 1,
		line: lines.length,
		column: column + 1,
	};
	throw new StackTraceEntry(
		{ start: positionS, end: positionE },
		'',
		'',
		new Error(
			`XPST0003: Failed to parse script. Expected ${[...new Set(parseResult.expected)]}`
		)
	);
}
