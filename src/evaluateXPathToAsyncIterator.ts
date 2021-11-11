import IDomFacade from './domFacade/IDomFacade';
import evaluateXPath, { EvaluableExpression } from './evaluateXPath';
import { Options } from './types/Options';

/**
 * Evaluates an XPath on the given contextNode. Returns the result as an async iterator
 *
 * @public
 *
 * @param  selector    - The selector to execute. Supports XPath 3.1.
 * @param  contextItem - The node from which to run the XPath.
 * @param  domFacade   - The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables   - Extra variables (name to value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param  options     - Extra options for evaluating this XPath.
 *
 * @returns An async iterator to the return values.
 */
export default function evaluateXPathToAsyncIterator(
	selector: EvaluableExpression,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): AsyncIterableIterator<any> {
	return evaluateXPath(
		selector,
		contextItem,
		domFacade,
		variables,
		evaluateXPath.ASYNC_ITERATOR_TYPE,
		options
	);
}
