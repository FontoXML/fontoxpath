import IDomFacade from './domFacade/IDomFacade';
import buildEvaluationContext from './evaluationUtils/buildEvaluationContext';
import { printAndRethrowError } from './evaluationUtils/printAndRethrowError';
import DynamicContext from './expressions/DynamicContext';
import ExecutionParameters from './expressions/ExecutionParameters';
import Expression from './expressions/Expression';
import { getBucketsForNode } from './getBuckets';
import convertXDMReturnValue, { IReturnTypes, ReturnType } from './parsing/convertXDMReturnValue';
import { markXPathEnd, markXPathStart } from './performance';
import { TypedExternalValue, UntypedExternalValue } from './types/createTypedValueFactory';
import { Language, Options } from './types/Options';
import { Node } from './types/Types';

/**
 * @public
 */
export type EvaluateXPath = {
	/**
	 * Evaluates an XPath on the given contextItem.
	 *
	 * If the return type is ANY_TYPE, the returned value depends on the result of the XPath:
	 *  * If the XPath evaluates to the empty sequence, an empty array is returned.
	 *  * If the XPath evaluates to a singleton node, that node is returned.
	 *  * If the XPath evaluates to a singleton value, that value is atomized and returned.
	 *  * If the XPath evaluates to a sequence of nodes, those nodes are returned.
	 *  * Else, the sequence is atomized and returned.
	 *
	 * @public
	 *
	 * @param  selector    - The selector to execute. Supports XPath 3.1.
	 * @param  contextItem - The node from which to run the XPath.
	 * @param  domFacade   - The domFacade (or DomFacade like interface) for retrieving relations.
	 * @param  variables   - Extra variables (name to value). Values can be number, string, boolean, nodes or object literals and arrays.
	 * @param  returnType  - One of the return types, indicates the expected type of the XPath query.
	 * @param  options     - Extra options for evaluating this XPath
	 *
	 * @returns The result of executing this XPath
	 */
	<TNode extends Node, TReturnType extends keyof IReturnTypes<TNode>>(
		selector: string,
		contextItem?: any | null,
		domFacade?: IDomFacade | null,
		variables?: { [s: string]: any } | null,
		returnType?: TReturnType,
		options?: Options | null
	): IReturnTypes<TNode>[TReturnType];

	/**
	 * Returns the result of the query, can be anything depending on the
	 * query. Note that the return type is determined dynamically, not
	 * statically: XPaths returning empty sequences will return empty
	 * arrays and not null, like one might expect.
	 */
	ANY_TYPE: ReturnType.ANY;

	ARRAY_TYPE: ReturnType.ARRAY;

	ASYNC_ITERATOR_TYPE: ReturnType.ASYNC_ITERATOR;

	/**
	 * Resolves to true or false, uses the effective boolean value to
	 * determine the result. count(1) resolves to true, count(())
	 * resolves to false
	 */
	BOOLEAN_TYPE: ReturnType.BOOLEAN;

	/**
	 * Resolves to the first node.NODES_TYPE would have resolved to.
	 */
	FIRST_NODE_TYPE: ReturnType.FIRST_NODE;

	/**
	 * Resolve to an object, as a map
	 */
	MAP_TYPE: ReturnType.MAP;

	/**
	 * Resolve to all nodes the XPath resolves to. Returns nodes in the
	 * order the XPath would. Meaning (//a, //b) resolves to all A nodes,
	 * followed by all B nodes. //*[self::a or self::b] resolves to A and
	 * B nodes in document order.
	 */
	NODES_TYPE: ReturnType.NODES;

	/**
	 * Resolve to a number, like count((1,2,3)) resolves to 3.
	 */
	NUMBER_TYPE: ReturnType.NUMBER;

	/**
	 * Resolve to an array of numbers
	 */
	NUMBERS_TYPE: ReturnType.NUMBERS;

	/**
	 * Resolve to a string, like //someElement[1] resolves to the text
	 * content of the first someElement
	 */
	STRING_TYPE: ReturnType.STRING;

	/**
	 * Resolve to an array of strings
	 */
	STRINGS_TYPE: ReturnType.STRINGS;

	/**
	 * Can be used to signal an XPath program should executed
	 */
	XPATH_3_1_LANGUAGE: Language.XPATH_3_1_LANGUAGE;

	/**
	 * Can be used to signal an XQuery program should be executed instead
	 * of an XPath
	 */
	XQUERY_3_1_LANGUAGE: Language.XQUERY_3_1_LANGUAGE;

	/**
	 * Can be used to signal Update facility can be used.
	 *
	 * To catch pending updates, use {@link evaluateUpdatingExpression}
	 */
	XQUERY_UPDATE_3_1_LANGUAGE: Language.XQUERY_UPDATE_3_1_LANGUAGE;
};
const evaluateXPath = <TNode extends Node, TReturnType extends keyof IReturnTypes<TNode>>(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: {
		[s: string]: TypedExternalValue | UntypedExternalValue;
	} | null,
	returnType?: TReturnType,
	options?: Options | null
): IReturnTypes<TNode>[TReturnType] => {
	returnType = returnType || (ReturnType.ANY as any);
	if (!selector || typeof selector !== 'string') {
		throw new TypeError("Failed to execute 'evaluateXPath': xpathExpression must be a string.");
	}

	options = options || {};

	let dynamicContext: DynamicContext;
	let executionParameters: ExecutionParameters;
	let expression: Expression;
	try {
		const context = buildEvaluationContext(
			selector,
			contextItem,
			domFacade || null,
			variables || {},
			options,
			{
				allowUpdating: options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
				allowXQuery:
					options['language'] === Language.XQUERY_3_1_LANGUAGE ||
					options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
				debug: !!options['debug'],
				disableCache: !!options['disableCache'],
				annotateAst: !!options['annotateAst'],
			}
		);
		dynamicContext = context.dynamicContext;
		executionParameters = context.executionParameters;
		expression = context.expression;
	} catch (error) {
		printAndRethrowError(selector, error);
	}

	if (expression.isUpdating) {
		throw new Error(
			'XUST0001: Updating expressions should be evaluated as updating expressions'
		);
	}

	// Shortcut: if the xpathExpression defines buckets, the
	// contextItem is a node and we are evaluating to a bucket, we can
	// use it to return false if we are sure it won't match.
	if (returnType === ReturnType.BOOLEAN && contextItem && 'nodeType' in contextItem) {
		const selectorBucket = expression.getBucket();
		const bucketsForNode = getBucketsForNode(contextItem);
		if (selectorBucket !== null && !bucketsForNode.includes(selectorBucket)) {
			// We are sure that this selector will never match, without even running it
			return false as IReturnTypes<TNode>[TReturnType];
		}
	}

	try {
		markXPathStart(selector);
		const rawResults = expression.evaluateMaybeStatically(dynamicContext, executionParameters);
		const toReturn = convertXDMReturnValue<TNode, TReturnType>(
			selector,
			rawResults,
			returnType,
			executionParameters
		);
		markXPathEnd(selector);

		return toReturn;
	} catch (error) {
		printAndRethrowError(selector, error);
	}
};

Object.assign(evaluateXPath, {
	ANY_TYPE: ReturnType.ANY,
	NUMBER_TYPE: ReturnType.NUMBER,
	STRING_TYPE: ReturnType.STRING,
	BOOLEAN_TYPE: ReturnType.BOOLEAN,
	NODES_TYPE: ReturnType.NODES,
	FIRST_NODE_TYPE: ReturnType.FIRST_NODE,
	STRINGS_TYPE: ReturnType.STRINGS,
	MAP_TYPE: ReturnType.MAP,
	ARRAY_TYPE: ReturnType.ARRAY,
	ASYNC_ITERATOR_TYPE: ReturnType.ASYNC_ITERATOR,
	NUMBERS_TYPE: ReturnType.NUMBERS,
	XQUERY_UPDATE_3_1_LANGUAGE: Language.XQUERY_UPDATE_3_1_LANGUAGE,
	XQUERY_3_1_LANGUAGE: Language.XQUERY_3_1_LANGUAGE,
	XPATH_3_1_LANGUAGE: Language.XPATH_3_1_LANGUAGE,
});

// Set all of the properties a second time to prevent closure renames
Object.assign(evaluateXPath, {
	['ANY_TYPE']: ReturnType.ANY,
	['NUMBER_TYPE']: ReturnType.NUMBER,
	['STRING_TYPE']: ReturnType.STRING,
	['BOOLEAN_TYPE']: ReturnType.BOOLEAN,
	['NODES_TYPE']: ReturnType.NODES,
	['FIRST_NODE_TYPE']: ReturnType.FIRST_NODE,
	['STRINGS_TYPE']: ReturnType.STRINGS,
	['MAP_TYPE']: ReturnType.MAP,
	['ARRAY_TYPE']: ReturnType.ARRAY,
	['ASYNC_ITERATOR_TYPE']: ReturnType.ASYNC_ITERATOR,
	['NUMBERS_TYPE']: ReturnType.NUMBERS,
	['XQUERY_UPDATE_3_1_LANGUAGE']: Language.XQUERY_UPDATE_3_1_LANGUAGE,
	['XQUERY_3_1_LANGUAGE']: Language.XQUERY_3_1_LANGUAGE,
	['XPATH_3_1_LANGUAGE']: Language.XPATH_3_1_LANGUAGE,
});

export default evaluateXPath as EvaluateXPath;
