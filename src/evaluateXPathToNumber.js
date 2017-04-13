import evaluateXPath from './evaluateXPath';

/**
 * Evaluates an XPath on the given contextNode. Returns the numeric result.
 *
 * @param  {!string}           selector     The selector to execute. Supports XPath 3.1.
 * @param  {!Node}             contextNode  The node from which to run the XPath.
 * @param  {?IDomFacade=}      domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}          variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  {?Object=}          options      Extra options for evaluating this XPath
 *
 * @return  {number}             The numerical result.
 */
export default function evaluateXPathToNumber (selector, contextNode, domFacade, variables, options) {
	return /** @type {!number} */ (evaluateXPath(selector, contextNode, domFacade, variables, evaluateXPath.NUMBER_TYPE, options));
}
