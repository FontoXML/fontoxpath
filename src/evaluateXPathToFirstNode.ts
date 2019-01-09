import evaluateXPath, { Options } from './evaluateXPath';
import IDomFacade from './domFacade/IDomFacade';

/**
 * Evaluates an XPath on the given contextNode. Returns the first node result.
 *
 * @param  selector     The selector to execute. Supports XPath 3.1.
 * @param  contextNode  The node from which to run the XPath.
 * @param  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables    Extra variables (name=>value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param  options      Extra options for evaluating this XPath.
 *
 * @return The first matching node, in the order defined by the XPath.
 */
export default function evaluateXPathToFirstNode (
	selector: string,
	contextNode?: any,
	domFacade?: IDomFacade,
	variables?: ({[s: string]: any }),
	options?: Options
): Node|null {
	return evaluateXPath(selector, contextNode, domFacade, variables, evaluateXPath.FIRST_NODE_TYPE, options);
}
