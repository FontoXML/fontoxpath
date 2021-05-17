import IDocumentWriter from '../documentWriter/IDocumentWriter';
import INodesFactory from '../nodesFactory/INodesFactory';

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

/**
 * @public
 */
export type Logger = {
	trace: (message: string) => void;
};

/**
 * An unresolved qualified name. Exists of a prefix and a local name
 *
 * @public
 */
export type LexicalQualifiedName = {
	localName: string;
	prefix: string;
};

/**
 * A qualified name, consists of a localname and a namespace URI
 *
 * @public
 */
export type ResolvedQualifiedName = {
	localName: string;
	namespaceURI: string;
};

/**
 * Resolves a function name to its resolved QName form
 *
 * @public
 */
export type FunctionNameResolver = (
	qname: LexicalQualifiedName,
	arity: number
) => ResolvedQualifiedName;

/**
 * Resolves a namespace prefix to its URI
 *
 * @public
 */
export type NamespaceResolver = (prefix: string) => string | null;

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
	 * Hook that is called whenever a function name is resolved. Can be used to redirect function
	 * calls to a different implementation.
	 *
	 * Example uses are 'joining' multiple function libraries together, like how XForms exposes
	 * functions in the `fn` namespace in the `xforms-functions` namespace.
	 *
	 * This function uses the default function namespace uri combined with the imported modules and
	 * the namespace resolver by default.
	 *
	 * Locally declared namespace resolving always takes precedence.
	 *
	 * @public
	 *
	 * @param qname - The lexical qualified name of the function that needs resolving
	 * @param  arity - The arity of the function.
	 *
	 * @returns The resolved name.
	 */
	functionNameResolver?: FunctionNameResolver;

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
	namespaceResolver?: NamespaceResolver;

	/**
	 * How to create new elements when using XQuery or XQuery Update Facility. Defaults to creating
	 * elements using the document implementation related to the passed context node.
	 */
	nodesFactory?: INodesFactory;

	annotateAst?: boolean;
};
