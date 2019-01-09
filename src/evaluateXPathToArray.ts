import evaluateXPath, { Options } from './evaluateXPath';
import IDomFacade from './domFacade/IDomFacade';

/**
 * Evaluates an XPath on the given contextNode. Returns the result as an array, if the result is an XPath array.
 *
 * @param  selector     The selector to execute. Supports XPath 3.1.
 * @param  contextNode  The node from which to run the XPath.
 * @param  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables    Extra variables (name=>value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param  options      Extra options for evaluating this XPath.
 *
 * @return The array result, as a JavaScript array with atomized values.
 */
export default function evaluateXPathToArray(
	selector: string,
	contextNode?: any,
	domFacade?: IDomFacade,
	variables?: ({[s: string]: any }),
	options?: Options
): any[] {
	return evaluateXPath(selector, contextNode, domFacade, variables, evaluateXPath.ARRAY_TYPE, options);
}
