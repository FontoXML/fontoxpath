import IDomFacade from './domFacade/IDomFacade';
import evaluateXPath, { Options } from './evaluateXPath';

/**
 * Evaluates an XPath on the given contextNode. Returns the result as a map, if the result is an XPath map.
 *
 * @param  selector     The selector to execute. Supports XPath 3.1.
 * @param  contextItem  The node from which to run the XPath.
 * @param  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables    Extra variables (name=>value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param  options      Extra options for evaluating this XPath.
 *
 * @return The map result, as an object. Because of JavaScript
 * constraints, key 1 and '1' are the same. The values in this map are
 * the JavaScript simple types. See evaluateXPath for more details in
 * mapping types.
 */
export default function evaluateXPathToMap(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): { [s: string]: any } {
	return evaluateXPath(
		selector,
		contextItem,
		domFacade,
		variables,
		evaluateXPath.MAP_TYPE,
		options
	);
}
