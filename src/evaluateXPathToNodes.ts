import evaluateXPath from './evaluateXPath';
import IDomFacade from './domFacade/IDomFacade';

/**
 * Evaluates an XPath on the given contextNode. Returns the first node result.
 * Returns result in the order defined in the XPath. The path operator ('/'), the union operator ('union' and '|') will sort.
 * This implies (//A, //B) resolves to all A nodes, followed by all B nodes, both in document order, but not merged.
 * However: (//A | //B) resolves to all A and B nodes in document order.
 *
 * @param  selector     The selector to execute. Supports XPath 3.1.
 * @param  contextNode  The node from which to run the XPath.
 * @param  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  options      Extra options for evaluating this XPath
 *
 * @return All matching Nodes, in the order defined by the XPath
 */
export default function evaluateXPathToNodes (
	selector: string,
	contextNode?: any,
	domFacade?: IDomFacade,
	variables?: ({[s: string]: any }),
	options?: (object)
): Array<Node> {
	return evaluateXPath(selector, contextNode, domFacade, variables, evaluateXPath.NODES_TYPE, options);
}