import IDomFacade from './domFacade/IDomFacade';
import evaluateXPath, { Options } from './evaluateXPath';
import { ReturnType } from './parsing/convertXDMReturnValue';
import { Node } from './types/Types';

/**
 * Evaluates an XPath on the given contextNode. Returns the first node result.
 * Returns result in the order defined in the XPath. The path operator ('/'), the union operator ('union' and '|') will sort.
 * This implies (//A, //B) resolves to all A nodes, followed by all B nodes, both in document order, but not merged.
 * However: (//A | //B) resolves to all A and B nodes in document order.
 *
 * @public
 *
 * @param  selector    - The selector to execute. Supports XPath 3.1.
 * @param  contextItem - The node from which to run the XPath.
 * @param  domFacade   - The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables   - Extra variables (name to value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param  options     - Extra options for evaluating this XPath.
 *
 * @returns All matching Nodes, in the order defined by the XPath.
 */
export default function evaluateXPathToNodes<T extends Node>(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): T[] {
	return evaluateXPath<T, ReturnType.NODES>(
		selector,
		contextItem,
		domFacade,
		variables,
		evaluateXPath.NODES_TYPE,
		options
	);
}
