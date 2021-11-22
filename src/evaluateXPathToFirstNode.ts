import IDomFacade from './domFacade/IDomFacade';
import evaluateXPath, { EvaluableExpression } from './evaluateXPath';
import { ReturnType } from './parsing/convertXDMReturnValue';
import { Options } from './types/Options';
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
	selector: EvaluableExpression,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): T | null {
	return evaluateXPath<T, ReturnType.FIRST_NODE>(
		selector,
		contextItem,
		domFacade,
		variables,
		evaluateXPath.FIRST_NODE_TYPE,
		options
	);
}
