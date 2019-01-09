import evaluateXPath, { Options } from './evaluateXPath';
import IDomFacade from './domFacade/IDomFacade';

/**
 * Evaluates an XPath on the given contextNode. Returns the numeric result.
 *
 * @param  selector     The selector to execute. Supports XPath 3.1.
 * @param  contextItem  The node from which to run the XPath.
 * @param  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables    Extra variables (name=>value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param  options      Extra options for evaluating this XPath.
 *
 * @return The numerical result.
 */
export default function evaluateXPathToNumber (
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): number {
	return evaluateXPath(selector, contextItem, domFacade, variables, evaluateXPath.NUMBER_TYPE, options);
}
