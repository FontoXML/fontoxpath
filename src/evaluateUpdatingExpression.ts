import PossiblyUpdatingExpression from './expressions/PossiblyUpdatingExpression';
import buildContext from './evaluationUtils/buildContext';

/**
 * Evaluates an XPath on the given contextItem. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @param  updateScript The updateScript to execute. Supports XPath 3.1.
 * @param  contextItem  The initial context for the script
 * @param  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  options      Extra options for evaluating this XPath
 *
 * @return The string result.
 */
export default async function evaluateUpdatingExpression (updateScript: string, contextItem: any, domFacade: any, variables: Object, options: {disableCache?: boolean}) {
	let {
		dynamicContext,
		executionParameters,
		expression
	} = buildContext(
		updateScript,
		contextItem,
		domFacade || null,
		variables || {},
		options || {},
		{
			allowXQuery: true,
			allowUpdating: true,
			disableCache: options.disableCache
		}
	);

	if (!expression.isUpdating) {
		throw new Error(`The expression ${updateScript} is not updating and can not be executed as an updating expression.`);
	}

	const resultIterator = (<PossiblyUpdatingExpression> expression).evaluateWithUpdateList(dynamicContext, executionParameters);

	let attempt = resultIterator.next();
	while (!attempt.ready) {
		await attempt.promise;
		attempt = resultIterator.next();
	}

	return {
		'xdmValue': attempt.value.xdmValue,
		'pendingUpdateList': attempt.value.pendingUpdateList.map(update => update.toTransferable())
	};
}
