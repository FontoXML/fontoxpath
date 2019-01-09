import evaluateXPath, { Options } from './evaluateXPath';
import IDomFacade from './domFacade/IDomFacade';


/**
 * Evaluates an XPath on the given contextNode. Returns the result as a map, if the result is an XPath map.
 *
 * @param  selector     The selector to execute. Supports XPath 3.1.
 * @param  contextNode  The node from which to run the XPath.
 * @param  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  options      Extra options for evaluating this XPath
 *
 * @return The map result, as an object. Because of JavaScript
 * constraints, key 1 and '1' are the same. The values in this map are
 * the JavaScript simple types. See evaluateXPath for more details in
 * mapping types.
 */
export default function evaluateXPathToMap (
	selector: string,
	contextNode?: any,
	domFacade?: IDomFacade,
	variables?: ({[s: string]: any }),
	options?: Options
): {[s: string]: any} {
	return evaluateXPath(selector, contextNode, domFacade, variables, evaluateXPath.MAP_TYPE, options);
}
