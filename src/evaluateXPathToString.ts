import evaluateXPath, { Options } from './evaluateXPath';
import IDomFacade from './domFacade/IDomFacade';

/**
 * Evaluates an XPath on the given contextNode. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @param  selector     The selector to execute. Supports XPath 3.1.
 * @param  contextItem  The node from which to run the XPath.
 * @param  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables    Extra variables (name=>value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param  options      Extra options for evaluating this XPath.
 *
 * @return The string result.
 */
export default function evaluateXPathToString(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): string {
	return evaluateXPath(
		selector,
		contextItem,
		domFacade,
		variables,
		evaluateXPath.STRING_TYPE,
		options
	);
}
