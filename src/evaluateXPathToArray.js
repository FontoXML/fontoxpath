import evaluateXPath from './evaluateXPath';

/**
 * Evaluates an XPath on the given contextNode. Returns the result as an array, if the result is an XPath array.
 *
 * @param  {!string}            selector     The selector to execute. Supports XPath 3.1.
 * @param  {!Node}              contextNode  The node from which to run the XPath.
 * @param  {?IDomFacade=}       domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}           variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  {?Object=}           options      Extra options for evaluating this XPath
 *
 * @return  {!Array<!Object>}   The array result, as a JavaScript array with atomized values
 */
export default function evaluateXPathToArray (selector, contextNode, domFacade, variables, options) {
	return /** @type {!Array<!Object>} */ (evaluateXPath(selector, contextNode, domFacade, variables, evaluateXPath.ARRAY_TYPE, options));
};
