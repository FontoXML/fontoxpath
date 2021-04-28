/**
 * Precompile an XPath selector asynchronously.
 *
 * @deprecated This code is deprecated. This is a no-op!
 *
 * @public
 *
 * @param   xPathString - The xPath which should be pre-compiled
 *
 * @returns  A promise which is resolved with the xpath string after compilation.
 */
export default function precompileXPath(xPathString: string): Promise<string> {
	return Promise.resolve(xPathString);
}
