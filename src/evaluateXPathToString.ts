import evaluateXPath from './evaluateXPath';
import IDomFacade from './domFacade/IDomFacade';

/**
 * Evaluates an XPath on the given contextNode. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @param  selector     The selector to execute. Supports XPath 3.1.
 * @param  contextNode  The node from which to run the XPath.
 * @param  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  options      Extra options for evaluating this XPath
 *
 * @return The string result.
 */
export default function evaluateXPathToString (
	selector: string,
	contextNode?: any,
	domFacade?: IDomFacade,
	variables?: ({[s: string]: any }),
	options?: (object)
): string {
	return evaluateXPath(selector, contextNode, domFacade, variables, evaluateXPath.STRING_TYPE, options);
}
