define([
	'./evaluateXPath'
], function (
	evaluateXPath
) {
	'use strict';

	/**
	 * Evaluates an XPath on the given contextNode. Returns the first node result.
	 * Returns result in the order defined in the XPath. The path operator ('/'), the union operator ('union' and '|') will sort.
	 * This implies (//A, //B) resolves to all A nodes, followed by all B nodes, both in document order, but not merged.
	 * However: (//A | //B) resolves to all A and B nodes in document order.
	 *
	 * @param  {Selector|String}   XPathSelector  The selector to execute. Supports XPath 3.1.
	 * @param  {Node}              contextNode    The node from which to run the XPath.
	 * @param  {Blueprint}         blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
	 * @param  {[Object]}          variables      Extra variables (name=>value). Values can be number / string or boolean.
	 *
	 * @return  {Node}             Al matching Nodes, in the order defined by the XPath
	 */

	return function evaluateXPathToNodes (selector, contextNode, blueprint, variables) {
		return evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.NODES_TYPE);
	};
});
