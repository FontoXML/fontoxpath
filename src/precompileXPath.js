import createSelectorFromXPathAsync from './parsing/createSelectorFromXPathAsync';

/**
 * Precompile an XPath selector asynchronously.
 * After compilation, the result is cached so that it can be reused using the synchronous functions.
 *
 * @param   {string}	xPathString  The xPath which should be pre-compiled
 *
 * @return  {Promise}   A promise which is resolved with the xpath string after compilation.
 */
export default function precompileXPath (xPathString) {
	return createSelectorFromXPathAsync(xPathString)
		.then(function (_selector) {
			return xPathString;
		});
}
