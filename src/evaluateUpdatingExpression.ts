import PossiblyUpdatingExpression from './expressions/PossiblyUpdatingExpression';
import buildContext from './evaluationUtils/buildContext';
import IDomFacade from './domFacade/IDomFacade';
import IDocumentWriter from './documentWriter/IDocumentWriter';
import INodesFactory from './nodesFactory/INodesFactory';

export type UpdatingOptions = {
	namespaceResolver?: (s: string) => string|null;
	documentWriter?: IDocumentWriter
	nodesFactory?: INodesFactory;
	moduleImports?: {[s: string]: string},
	disableCache?: boolean
};

/**
 * Evaluates an XPath on the given contextItem. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @param  updateScript The updateScript to execute. Supports XPath 3.1.
 * @param  contextItem  The initial context for the script
 * @param  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  variables    Extra variables (name=>value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param  options      Extra options for evaluating this XPath.
 *
 * @return The query result and pending update list.
 */
export default async function evaluateUpdatingExpression(
	updateScript: string,
	contextItem?: any,
	domFacade?: IDomFacade,
	variables?: { [s: string]: any },
	options?: UpdatingOptions
): Promise<{ xdmValue: any[], pendingUpdateList: object[] }> {
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

	const resultIterator = (<PossiblyUpdatingExpression>expression).evaluateWithUpdateList(dynamicContext, executionParameters);

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
