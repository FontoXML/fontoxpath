import IDomFacade from './domFacade/IDomFacade';
import evaluateXPath, { Options } from './evaluateXPath';

/**
 * Evaluates an XPath on the given contextNode.
 *
 * @public
 *
 * @param  selector    - The selector to execute. Supports XPath 3.1.
 * @param  contextItem - The node from which to run the XPath.
 * @param  domFacade   - The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables   - Extra variables (name to value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param  options     - Extra options for evaluating this XPath.
 *
 * @returns A boolean result
 */
export default function evaluateXPathToBoolean(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): boolean {
	return evaluateXPath(
		selector,
		contextItem,
		domFacade,
		variables,
		evaluateXPath.BOOLEAN_TYPE,
		options
	);
}
