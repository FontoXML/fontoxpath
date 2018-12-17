import PossiblyUpdatingExpression from './expressions/PossiblyUpdatingExpression';
import buildContext from './evaluationUtils/buildContext';
/**
 * Evaluates an XPath on the given contextItem. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @param  {!string}       updateScript     The updateScript to execute. Supports XPath 3.1.
 * @param  {*}             contextItem  The initial context for the script
 * @param  {?IDomFacade=}  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}      variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  {?Object=}      options      Extra options for evaluating this XPath
 *
 * @return  {Promise<{pendingUpdateList: Array<Object>, xdmValue: Object}>}         The string result.
 */
export default async function evaluateUpdatingExpression (updateScript, contextItem, domFacade, variables, options) {
	const {
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
			disableCache: false
		}
	);

	if (!expression.isUpdating) {
		throw new Error(`The expression ${updateScript} is not updating and can not be executed as an updating expression.`);
	}

	const resultIterator = (/** @type {PossiblyUpdatingExpression} **/(expression)).evaluateWithUpdateList(dynamicContext, executionParameters);

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
