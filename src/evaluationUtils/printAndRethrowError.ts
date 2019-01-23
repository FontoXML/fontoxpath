import { StackTraceEntry } from '../expressions/debug/StackTraceEntry';

function getNumberStringLength(i: number) {
	return Math.floor(Math.log10(i)) + 1;
}

export function printAndRethrowError(selector: string, error: Error | StackTraceEntry): never {
	if (error instanceof Error) {
		throw new Error(`Error executing XPath: ${error}`);
	}

	// This must be a StackTraceEntry 'error'
	const stackEntry = error;
	const errorLocation = stackEntry.getErrorLocation();
	const rawLines = selector.replace('\r', '').split('\n');

	const lineNumberStringLength = getNumberStringLength(
		Math.min(errorLocation.end.line + 2, rawLines.length)
	);

	const lines = rawLines.reduce((markedLines: string[], line, i) => {
		const lineNumber = i + 1;
		// Only mark 2 lines before and after
		if (errorLocation.start.line - lineNumber > 2 || lineNumber - errorLocation.end.line > 2) {
			return markedLines;
		}

		const prefix = `${Array(lineNumberStringLength)
			.fill(' ', 0, getNumberStringLength(lineNumber) - lineNumberStringLength)
			.join('')}${lineNumber}: `;

		markedLines.push(`${prefix}${line}`);

		if (lineNumber >= errorLocation.start.line && lineNumber <= errorLocation.end.line) {
			const endColumn =
				lineNumber < errorLocation.end.line
					? line.length + prefix.length
					: errorLocation.end.column - 1 + prefix.length;
			const startColumn =
				lineNumber > errorLocation.start.line
					? prefix.length
					: errorLocation.start.column - 1 + prefix.length;
			markedLines.push(
				Array(prefix.length + line.length)
					.fill(' ', 0, startColumn)
					.fill('^', startColumn, endColumn)
					.join('')
			);
		}
		return markedLines;
	}, []);

	const stackTrace = stackEntry.makeStackTrace().join('\n');
	const errorMessage = lines.join('\n') + '\n\n' + stackTrace;
	const newError = new Error(errorMessage);
	console.error(errorMessage);
	throw newError;
}
