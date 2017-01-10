import evaluateXPath from './evaluateXPath';
import Selector from './selectors/Selector';

/**
 * Evaluates an XPath on the given contextNode. Returns the numeric result.
 *
 * @param  {!Selector|string}  selector       The selector to execute. Supports XPath 3.1.
 * @param  {!Node}             contextNode    The node from which to run the XPath.
 * @param  {!IDomFacade}       blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}          variables      Extra variables (name=>value). Values can be number / string or boolean.
 *
 * @return  {!Array<number>}   The numerical results.
 */
export default function evaluateXPathToNumber (selector, contextNode, blueprint, variables) {
	return /** @type {!Array<number>} */ (evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.NUMBERS_TYPE));
}
