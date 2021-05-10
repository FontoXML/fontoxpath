/**
 * Sanitize an untrusted string.
 *
 * Always use this function to escape user-supplied strings before including
 * them in JavaScript code that will be evaluated. Not doing so can open up
 * potential security problems, such as arbitrary code execution. JSON.stringify
 * ensures the untrusted string is a valid JavaScript string, according to [the
 * ECMAScript specification]{@link https://tc39.es/ecma262/#sec-json.stringify}.
 *
 * String.prototype.replace handles support for characters older JavaScript
 * engines [don't support]{@link
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#issue_with_plain_json.stringify_for_use_as_javascript}.
 *
 * @param untrustedString - User-supplied string.
 *
 * @returns A safe and valid JavaScript string.
 */
function escapeUntrustedString(untrustedString: string): string {
	return JSON.stringify(untrustedString)
		.replace(/\u2028/g, '\\u2028') // LINE SEPARATOR
		.replace(/\u2029/g, '\\u2029'); // PARAGRAPH SEPARATOR
}

export default escapeUntrustedString;
