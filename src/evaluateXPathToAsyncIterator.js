import evaluateXPath from './evaluateXPath';

/**
 * Evaluates an XPath on the given contextNode. Returns the result as an async iterator
 *
 * @param   {!string}           selector     The selector to execute. Supports XPath 3.1.
 * @param   {!Node}             contextNode    The node from which to run the XPath.
 * @param   {?IDomFacade=}      domFacade      The domFacade (or DomFacade like interface) for retrieving relations.
 * @param   {?Object=}          variables      Extra variables (name=>value). Values can be number / string or boolean.
 * @param   {?Object=}          options      Extra options for evaluating this XPath
 *
 * @return  {!Object}           The map result, as an object. Because of JavaScript constraints, key 1 and '1' are the same. The values in this map are the JavaScript simple types. See evaluateXPath for more details in mapping types.
 */
export default function evaluateXPathToAsyncIterator (selector, contextNode, domFacade, variables, options) {
	return /** @type {!Object} */ (evaluateXPath(
		selector,
		contextNode,
		domFacade,
		variables,
		evaluateXPath.ASYNC_ITERATOR_TYPE,
		options
	));
}
