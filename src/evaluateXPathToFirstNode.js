import evaluateXPath from './evaluateXPath';
import Selector from './selectors/Selector';

/**
 * Evaluates an XPath on the given contextNode. Returns the first node result.
 *
 * @param  {!Selector|string}  selector       The selector to execute. Supports XPath 3.1.
 * @param  {!Node}             contextNode    The node from which to run the XPath.
 * @param  {!IDomFacade}       blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}          variables      Extra variables (name=>value). Values can be number / string or boolean.
 *
 * @return  {!Node}            The first matching node, in the order defined by the XPath
 */
export default function evaluateXPathToFirstNode (selector, contextNode, blueprint, variables) {
	return /** @type {!Node} */ (evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.FIRST_NODE_TYPE));
}
