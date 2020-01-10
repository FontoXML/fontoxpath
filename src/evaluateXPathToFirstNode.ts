import IDomFacade from './domFacade/IDomFacade';
import evaluateXPath, { Options } from './evaluateXPath';
import { Node } from './types/Types';

/**
 * Evaluates an XPath on the given contextNode. Returns the first node result.
 *
 * @public
 *
 * @param  selector    - The selector to execute. Supports XPath 3.1.
 * @param  contextItem - The node from which to run the XPath.
 * @param  domFacade   - The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables   - Extra variables (name to value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param  options     - Extra options for evaluating this XPath.
 *
 * @returns The first matching node, in the order defined by the XPath.
 */
export default function evaluateXPathToFirstNode<T extends Node>(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): T | null {
	return evaluateXPath<T, 9>(
		selector,
		contextItem,
		domFacade,
		variables,
		evaluateXPath.FIRST_NODE_TYPE,
		options
	);
}
