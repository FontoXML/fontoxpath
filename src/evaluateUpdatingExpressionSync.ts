import IDomFacade from './domFacade/IDomFacade';
import { convertUpdateResultToTransferable, UpdatingOptions } from './evaluateUpdatingExpression';
import evaluateXPath, { IReturnTypes } from './evaluateXPath';
import buildContext from './evaluationUtils/buildContext';
import { printAndRethrowError } from './evaluationUtils/printAndRethrowError';
import DynamicContext from './expressions/DynamicContext';
import ExecutionParameters from './expressions/ExecutionParameters';
import Expression from './expressions/Expression';
import PossiblyUpdatingExpression from './expressions/PossiblyUpdatingExpression';
import UpdatingExpressionResult from './expressions/UpdatingExpressionResult';
import { IterationHint, IterationResult } from './expressions/util/iterators';
import { Node } from './types/Types';

/**
 * Evaluates an update script to a pending update list. See
 * [XQUF](https://www.w3.org/TR/xquery-update-30/) for more information on XQuery Update Facility.
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
export default function evaluateUpdatingExpressionSync<
	TNode extends Node,
	TReturnType extends keyof IReturnTypes<TNode>
>(
	updateScript: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: UpdatingOptions<TReturnType> | null
): { pendingUpdateList: object[]; xdmValue: IReturnTypes<TNode>[TReturnType] } {
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
		dynamicContext = context.dynamicContext;
		executionParameters = context.executionParameters;
		expression = context.expression;
	} catch (error) {
		printAndRethrowError(updateScript, error);
	}

	if (!expression.isUpdating) {
		// Non updating expressions should also be allowed to be executed as updating
		// scripts. Copy/modify/transform expressions are examples of updating expressions that are
		// not really updating
		return {
			['pendingUpdateList']: [],
			['xdmValue']: evaluateXPath<TNode, TReturnType>(
				updateScript,
				contextItem,
				domFacade,
				variables,
				options.returnType,
				options
			)
		};
	}

	let attempt: IterationResult<UpdatingExpressionResult>;
	try {
		const resultIterator = (expression as PossiblyUpdatingExpression).evaluateWithUpdateList(
			dynamicContext,
			executionParameters
		);

		attempt = resultIterator.next(IterationHint.NONE);
		while (!attempt.ready) {
			throw new Error('This script could not be evaluated in a not synchronous manner');
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
