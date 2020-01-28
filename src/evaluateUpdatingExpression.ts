import IDocumentWriter from './documentWriter/IDocumentWriter';
import IDomFacade from './domFacade/IDomFacade';
import { Language } from './evaluateXPath';
import evaluateXPathToAsyncIterator from './evaluateXPathToAsyncIterator';
import buildContext from './evaluationUtils/buildContext';
import convertUpdateResultToTransferable from './evaluationUtils/convertUpdateResultToTransferable';
import { printAndRethrowError } from './evaluationUtils/printAndRethrowError';
import DynamicContext from './expressions/DynamicContext';
import ExecutionParameters from './expressions/ExecutionParameters';
import Expression from './expressions/Expression';
import PossiblyUpdatingExpression from './expressions/PossiblyUpdatingExpression';
import UpdatingExpressionResult from './expressions/UpdatingExpressionResult';
import { IterationHint, IterationResult } from './expressions/util/iterators';
import INodesFactory from './nodesFactory/INodesFactory';
import { ReturnType } from './parsing/convertXDMReturnValue';

/**
 * @public
 */
export type UpdatingOptions = {
	debug?: boolean;
	disableCache?: boolean;
	documentWriter?: IDocumentWriter;
	moduleImports?: { [s: string]: string };
	namespaceResolver?: (s: string) => string | null;
	nodesFactory?: INodesFactory;
	returnType?: ReturnType;
};

/**
 * Evaluates an XPath on the given contextItem. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @public
 *
 * @param updateScript - The update script to execute. Supports XPath 3.1.
 * @param contextItem  - The node from which to run the XPath.
 * @param domFacade    - The domFacade (or DomFacade like interface) for retrieving relations.
 * @param variables    - Extra variables (name to value). Values can be number, string, boolean, nodes or object literals and arrays.
 * @param options      - Extra options for evaluating this XPath.
 *
 * @returns The query result and pending update list.
 */
export default async function evaluateUpdatingExpression(
	updateScript: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: UpdatingOptions | null
): Promise<{ pendingUpdateList: object[]; xdmValue: any[] }> {
	options = options || {};

	let dynamicContext: DynamicContext;
	let executionParameters: ExecutionParameters;
	let expression: Expression;
	try {
		const context = buildContext(
			updateScript,
			contextItem,
			domFacade || null,
			variables || {},
			options || {},
			{
				allowUpdating: true,
				allowXQuery: true,
				debug: !!options['debug'],
				disableCache: !!options['disableCache']
			}
		);
		const dynamicContextAndExecutionParameters = context.buildDynamicContextAndExecutionParameters();
		dynamicContext = dynamicContextAndExecutionParameters.dynamicContext;
		executionParameters = dynamicContextAndExecutionParameters.executionParameters;
		expression = context.expression;
	} catch (error) {
		printAndRethrowError(updateScript, error);
	}

	if (!expression.isUpdating) {
		// Non updating expressions should also be allowed to be executed as updating
		// scripts. Copy/modify/transform expressions are examples of updating expressions that are
		// not really updating
		const resultItems = [];
		const it = evaluateXPathToAsyncIterator(updateScript, contextItem, domFacade, variables, {
			...options,
			language: Language.XQUERY_UPDATE_3_1_LANGUAGE
		});
		for (let item = await it.next(); !item.done; item = await it.next()) {
			resultItems.push(item.value);
		}
		return Promise.resolve({
			['pendingUpdateList']: [],
			['xdmValue']: resultItems
		});
	}

	let attempt: IterationResult<UpdatingExpressionResult>;
	try {
		const resultIterator = (expression as PossiblyUpdatingExpression).evaluateWithUpdateList(
			dynamicContext,
			executionParameters
		);

		attempt = resultIterator.next(IterationHint.NONE);
		while (!attempt.ready) {
			await attempt.promise;
			attempt = resultIterator.next(IterationHint.NONE);
		}
	} catch (error) {
		printAndRethrowError(updateScript, error);
	}

	return convertUpdateResultToTransferable(
		attempt.value,
		updateScript,
		options['returnType'],
		executionParameters
	);
}
