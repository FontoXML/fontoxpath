import evaluateXPath from './evaluateXPath';

/**
 * Evaluates an XPath on the given contextNode. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @param  {!string}            selector     The selector to execute. Supports XPath 3.1.
 * @param  {!Node}              contextNode  The node from which to run the XPath.
 * @param  {?IDomFacade=}       domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}           variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  {?Object=}           options      Extra options for evaluating this XPath
 *
 * @return  {!string}           The string result.
 */
export default function evaluateXPathToString (selector, contextNode, domFacade, variables, options) {
	return /** @type {!string} */(evaluateXPath(selector, contextNode, domFacade, variables, evaluateXPath.STRING_TYPE, options));
}
