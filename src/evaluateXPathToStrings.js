define([
	'./evaluateXPath'
], function (
	evaluateXPath
) {
	'use strict';

	/**
	 * Evaluates an XPath on the given contextNode. Returns the string result as if the XPath is wrapped in string(...).
	 *
	 * @param  {Selector|String}   XPathSelector  The selector to execute. Supports XPath 3.1.
	 * @param  {Node}              contextNode    The node from which to run the XPath.
	 * @param  {Blueprint}         blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
	 * @param  {[Object]}          variables      Extra variables (name=>value). Values can be number / string or boolean.
	 *
	 * @return  {String[]}         The string result.
	 */
	return function evaluateXPathToString (selector, contextNode, blueprint, variables) {
		return evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.STRINGS_TYPE);
	};
});
