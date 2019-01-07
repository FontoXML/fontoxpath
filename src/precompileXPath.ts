/**
 * Precompile an XPath selector asynchronously.
 *
 * This code is deprecated. This is a no-op!
 *
 * @param   xPathString  The xPath which should be pre-compiled
 *
 * @return  A promise which is resolved with the xpath string after compilation.
 */
export default function precompileXPath(xPathString: string): Promise<string> {
	return Promise.resolve(xPathString);
}
