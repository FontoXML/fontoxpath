import evaluateXPath from './evaluateXPath';
import IDomFacade from './domFacade/IDomFacade';


/**
 * Evaluates an XPath on the given contextNode.
 *
 * @param  selector     The selector to execute. Supports XPath 3.1.
 * @param  contextNode  The node from which to run the XPath.
 * @param  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  options      Extra options for evaluating this XPath
 *
 * @return  {boolean}
 */
export default function evaluateXPathToBoolean 	(
	selector: string,
	contextNode?: any,
	domFacade?: IDomFacade,
	variables?: ({[s: string]: any }),
	options?: (object)
): boolean {
	return evaluateXPath(selector, contextNode, domFacade, variables, evaluateXPath.BOOLEAN_TYPE, options);
}