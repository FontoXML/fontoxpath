/**
 * Precompile an XPath selector asynchronously.
 *
 * This code is deprecated. This is a no-op!
 *
 * @param   {string}	xPathString  The xPath which should be pre-compiled
 *
 * @return  {Promise}   A promise which is resolved with the xpath string after compilation.
 */
export default function precompileXPath (xPathString) {
	return Promise.resolve(xPathString);
}
