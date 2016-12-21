define([
	'./evaluateXPath'
], function (
	evaluateXPath
) {
	'use strict';

	/**
	 * Evaluates an XPath on the given contextNode. Returns the result as an array, if the result is an XPath array.
	 *
	 * @param  {Selector|String}   XPathSelector  The selector to execute. Supports XPath 3.1.
	 * @param  {Node}              contextNode    The node from which to run the XPath.
	 * @param  {Blueprint}         blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
	 * @param  {[Object]}          variables      Extra variables (name=>value). Values can be number / string or boolean.
	 *
	 * @return  {Object[]}         The array result, as a JavaScript array with atomized values
	 */
	return function evaluateXPathToArray (selector, contextNode, blueprint, variables) {
		return evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.ARRAY_TYPE);
	};
});
