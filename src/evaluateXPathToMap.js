define([
	'./evaluateXPath'
], function (
	evaluateXPath
) {
	'use strict';

	/**
	 * Evaluates an XPath on the given contextNode. Returns the result as a map, if the result is an XPath map.
	 *
	 * @param  {Selector|String}   XPathSelector  The selector to execute. Supports XPath 3.1.
	 * @param  {Node}              contextNode    The node from which to run the XPath.
	 * @param  {Blueprint}         blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
	 * @param  {[Object]}          variables      Extra variables (name=>value). Values can be number / string or boolean.
	 *
	 * @return  {Object}           The map result, as an object. Because of JavaScript constraints, key 1 and '1' are the same. The values in this map are the JavaScript simple types. See evaluateXPath for more details in mapping types.
	 */
	return function evaluateXPathToMap (selector, contextNode, blueprint, variables) {
		return evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.MAP_TYPE);
	};
});
