import evaluateXPath from './evaluateXPath';
import IDomFacade from './domFacade/IDomFacade';

/**
 * Evaluates an XPath on the given contextNode. Returns the result as an async iterator
 *
 * @param  selector     The selector to execute. Supports XPath 3.1.
 * @param  contextNode  The node from which to run the XPath.
 * @param  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  options      Extra options for evaluating this XPath
 *
 * @return An async iterator to the return values
 */
export default function evaluateXPathToAsyncIterator (
	selector: string,
	contextNode?: any,
	domFacade?: IDomFacade,
	variables?: ({[s: string]: any }),
	options?: (object)
): AsyncIterator<any> {
	return evaluateXPath(
		selector,
		contextNode,
		domFacade,
		variables,
		evaluateXPath.ASYNC_ITERATOR_TYPE,
		options
	);
}
