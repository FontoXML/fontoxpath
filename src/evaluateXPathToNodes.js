import evaluateXPath from './evaluateXPath';

/**
 * Evaluates an XPath on the given contextNode. Returns the first node result.
 * Returns result in the order defined in the XPath. The path operator ('/'), the union operator ('union' and '|') will sort.
 * This implies (//A, //B) resolves to all A nodes, followed by all B nodes, both in document order, but not merged.
 * However: (//A | //B) resolves to all A and B nodes in document order.
 *
 * @param  {!string}           selector       The selector to execute. Supports XPath 3.1.
 * @param  {!Node}             contextNode    The node from which to run the XPath.
 * @param  {?IDomFacade=}      domFacade      The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}          variables      Extra variables (name=>value). Values can be number / string or boolean.
 * @param  {?Object=}           options      Extra options for evaluating this XPath
 *
 * @return  {Array<Node>}      All matching Nodes, in the order defined by the XPath
 */
export default function evaluateXPathToNodes (selector, contextNode, domFacade, variables, options) {
	return /** @type {Array<Node>} */(evaluateXPath(selector, contextNode, domFacade, variables, evaluateXPath.NODES_TYPE, options));
}
