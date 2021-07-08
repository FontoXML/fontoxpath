/**
 * Sanitize an untrusted string used in generated JavaScript code as a string
 * literal.
 *
 * Always use this function to escape user-provided strings before including
 * them in JavaScript code that will be evaluated. Not doing so can open up
 * security vulnerabilities, such as cross-site scripting. JSON.stringify
 * ensures the untrusted string is a valid JavaScript string, according to [the
 * ECMAScript specification]{@link https://tc39.es/ecma262/#sec-json.stringify}.
 *
 * String.prototype.replace handles support for characters older JavaScript
 * engines [don't support]{@link
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#issue_with_plain_json.stringify_for_use_as_javascript},
 * which ensures this function returns a valid string.
 *
 * @param untrustedString - User provided string.
 *
 * @returns An escaped and valid JavaScript string.
 */
function escapeJavaScriptString(untrustedString: string): string {
	return JSON.stringify(untrustedString)
		.replace(/\u2028/g, '\\u2028') // LINE SEPARATOR
		.replace(/\u2029/g, '\\u2029'); // PARAGRAPH SEPARATOR
}

/**
 * Sanitizes strings to stop them from being executable during interpretation
 * by escaping quotes and parentheses.
 * @param untrustedString User provided string to be sanitized.
 * @returns A sanitized version of the user string.
 */
export function sanitizeString(untrustedString: string): string {
	return untrustedString.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export default escapeJavaScriptString;
