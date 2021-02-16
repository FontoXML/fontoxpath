import IDocumentWriter from './documentWriter/IDocumentWriter';
import IDomFacade from './domFacade/IDomFacade';
import buildEvaluationContext from './evaluationUtils/buildEvaluationContext';
import { printAndRethrowError } from './evaluationUtils/printAndRethrowError';
import DynamicContext from './expressions/DynamicContext';
import ExecutionParameters from './expressions/ExecutionParameters';
import Expression from './expressions/Expression';
import { getBucketsForNode } from './getBuckets';
import INodesFactory from './nodesFactory/INodesFactory';
import convertXDMReturnValue, { IReturnTypes, ReturnType } from './parsing/convertXDMReturnValue';
import { markXPathEnd, markXPathStart } from './performance';
import { ExternalFunctionDefinition } from './registerCustomXPathFunction';
import { TypedExternalValue, UntypedExternalValue } from './types/createTypedValueFactory';
import { Node } from './types/Types';

/**
 * @public
 */
export type Logger = {
	trace: (message: string) => void;
};

/**
 * A qualified name
 *
 * @public
 */
export type ResolvedQualifiedName = {
	localName: string;
	namespaceURI: string;
};

/**
 * @public
 */
export type Options = {
	/**
	 * The current context for a query. Will be passed whenever an extension function is called. Can be
	 * used to implement the current function in XSLT.
	 *
	 * Undefined by default.
	 *
	 * @public
	 */
	currentContext?: any;

	/**
	 * Whether the query is ran in debug mode. Queries in debug mode output better stacktraces but
	 * are slower
	 *
	 * @public
	 */
	debug?: boolean;

	/**
	 * The default function namespace uri.
	 *
	 * Defaults to the fn namespace ('http://www.w3.org/2005/xpath-functions').
	 *
	 * @public
	 */
	defaultFunctionNamespaceURI?: string;

	/**
	 * Disables caching the compilation result of this expression. For internal use
	 *
	 * @public
	 */
	disableCache?: boolean;

	/**
	 * A facade that can be used to intercept any methods that will change a document in XQuery
	 * Update Facility when using the copy/transform syntax.
	 *
	 * Defaults to just changing the document.
	 *
	 * @public
	 */
	documentWriter?: IDocumentWriter;

	/**
	 * Hook that is called whenever a function will be called. Functions that are registered in a
	 * module that is already available will take precedence. Meaning `fn:abs()` will always call
	 * the `abs` function that is implemented in FontoXPath.
	 *
	 * @public
	 *
	 * @param qname - The qualified name of the function the needs resolving
	 * @param  arity - The arity of the function.
	 *
	 * @returns The function, or null. Return null if there is no such function.
	 */
	externalFunctionResolver?: (
		qname: ResolvedQualifiedName,
		arity: number
	) => ExternalFunctionDefinition | null;

	/**
	 * The language to use. Can be XPath, XQuery or XQuery Update Facility.
	 */
	language?: Language;

	/**
	 * Called whenever the `fn:trace()` function is called. Defaults to `console#log`
	 */
	logger?: Logger;

	/**
	 * Additional modules to import. Imported modules are always statically known
	 */
	moduleImports?: { [s: string]: string };

	/**
	 * How to resolve element namespaces. Defaults to returning `null`, which is the default
	 * namespace uri _or_ an error when resolving a prefix.
	 */
	namespaceResolver?: (s: string) => string | null;

	/**
	 * How to create new elements when using XQuery or XQuery Update Facility. Defaults to creating
	 * elements using the document implementation related to the passed context node.
	 */
	nodesFactory?: INodesFactory;
};

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
		contextItem?: TypedExternalValue | UntypedExternalValue | null,
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
	contextItem?: TypedExternalValue | UntypedExternalValue | null,
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
	if (
		returnType === ReturnType.BOOLEAN &&
		contextItem &&
		typeof contextItem === 'object' &&
		'nodeType' in contextItem
	) {
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

/**
 * Specifies which language to use.
 *
 * @public
 */
export enum Language {
	XPATH_3_1_LANGUAGE = 'XPath3.1',
	XQUERY_3_1_LANGUAGE = 'XQuery3.1',
	XQUERY_UPDATE_3_1_LANGUAGE = 'XQueryUpdate3.1',
}

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
