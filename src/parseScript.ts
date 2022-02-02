import domBackedDocumentWriter from './documentWriter/domBackedDocumentWriter';
import IDocumentWriter from './documentWriter/IDocumentWriter';
import ExternalDomFacade from './domFacade/ExternalDomFacade';
import { sequenceTypeToString } from './expressions/dataTypes/Value';
import { BUILT_IN_NAMESPACE_URIS } from './expressions/staticallyKnownNamespaces';
import StaticContext from './expressions/StaticContext';
import ISimpleNodesFactory from './nodesFactory/ISimpleNodesFactory';
import astHelper from './parsing/astHelper';
import normalizeEndOfLines from './parsing/normalizeEndOfLines';
import parseExpression from './parsing/parseExpression';
import processProlog from './parsing/processProlog';
import annotateAst from './typeInference/annotateAST';
import { AnnotationContext } from './typeInference/AnnotationContext';
import { Language, Options } from './types/Options';
import { Element, Text } from './types/Types';

const PREFERRED_PREFIX_BY_NAMESPACEURI: { [prefix: string]: string } = {
	[BUILT_IN_NAMESPACE_URIS.XQUERYX_NAMESPACE_URI]: 'xqx',
	[BUILT_IN_NAMESPACE_URIS.XQUERYX_UPDATING_NAMESPACE_URI]: 'xquf',
	[BUILT_IN_NAMESPACE_URIS.FONTOXPATH_NAMESPACE_URI]: 'x',
};

function getQName(name: string, parentUri: string): { localName: string; namespaceUri: string } {
	switch (name) {
		case 'copySource':
		case 'insertAfter':
		case 'insertAsFirst':
		case 'insertAsLast':
		case 'insertBefore':
		case 'insertInto':
		case 'modifyExpr':
		case 'newNameExpr':
		case 'replacementExpr':
		case 'replaceValue':
		case 'returnExpr':
		case 'sourceExpr':
		case 'targetExpr':
		case 'transformCopies':
		case 'transformCopy':
			// Some 'vanilla' elements are actually XQueryX elements. Check parent
			return {
				localName: name,
				namespaceUri: parentUri || BUILT_IN_NAMESPACE_URIS.XQUERYX_NAMESPACE_URI,
			};
		case 'deleteExpr':
		case 'insertExpr':
		case 'renameExpr':
		case 'replaceExpr':
		case 'transformExpr':
			// Elements added in the update facility need to be in a different namespace
			return {
				localName: name,
				namespaceUri: BUILT_IN_NAMESPACE_URIS.XQUERYX_UPDATING_NAMESPACE_URI,
			};
		case 'x:stackTrace':
			// Custom AST nodes introduced by fontoxpath for debugging
			return {
				localName: 'stackTrace',
				namespaceUri: BUILT_IN_NAMESPACE_URIS.FONTOXPATH_NAMESPACE_URI,
			};
		default:
			return {
				localName: name,
				namespaceUri: BUILT_IN_NAMESPACE_URIS.XQUERYX_NAMESPACE_URI,
			};
	}
}

/**
 * Transform the given JsonML fragment into the corresponding DOM structure, using the given document to
 * create nodes.
 *
 * JsonML is always expected to be a JavaScript structure. If you have a string of JSON, use JSON.parse first.
 *
 * @param   documentWriter -  Used to place nodes in the DOM
 * @param   simpleNodesFactory   -  Used to construct nodes
 * @param   jsonml   -  The JsonML fragment to parse
 *
 * @return  The root node of the constructed DOM fragment
 */
function parseNode(
	documentWriter: IDocumentWriter,
	simpleNodesFactory: ISimpleNodesFactory,
	jsonml: any[] | string,
	parentUri: string | null
): Text | Element {
	if (typeof jsonml === 'string') {
		if (jsonml.length === 0) {
			return null;
		}
		return simpleNodesFactory.createTextNode(jsonml);
	}

	if (!Array.isArray(jsonml)) {
		throw new TypeError('JsonML element should be an array or string');
	}

	const qName = getQName(jsonml[0], parentUri);
	const name = qName.localName;
	const namespaceUri = qName.namespaceUri;

	// Node must be a normal element
	const element = simpleNodesFactory.createElementNS(
		namespaceUri,
		PREFERRED_PREFIX_BY_NAMESPACEURI[namespaceUri] + ':' + name
	);
	const firstChild = jsonml[1];
	let firstChildIndex = 1;
	if (typeof firstChild === 'object' && !Array.isArray(firstChild)) {
		for (const attributeName in firstChild) {
			if (firstChild[attributeName] !== null) {
				if (attributeName === 'type') {
					// TODO: prevent writing undefined to variables at the first place
					if (firstChild[attributeName] !== undefined) {
						documentWriter.setAttributeNS(
							element,
							namespaceUri,
							'fontoxpath:' + attributeName,
							sequenceTypeToString(firstChild[attributeName])
						);
					}
				} else {
					documentWriter.setAttributeNS(
						element,
						namespaceUri,
						PREFERRED_PREFIX_BY_NAMESPACEURI[namespaceUri] + ':' + attributeName,
						firstChild[attributeName]
					);
				}
			}
		}
		firstChildIndex = 2;
	}
	// Parse children
	for (let i = firstChildIndex, l = jsonml.length; i < l; ++i) {
		const node = parseNode(
			documentWriter,
			simpleNodesFactory,
			jsonml[i] as any[] | string,
			namespaceUri
		);
		if (node !== null) {
			documentWriter.insertBefore(element, node, null);
		}
	}

	return element;
}

/**
 * Parse an XPath or XQuery script and output it as an XQueryX element. Refer to the [XQueryX
 * spec](https://www.w3.org/TR/xqueryx-31/) for more info.
 *
 * The precise generated XQueryX may change in the future when progress is made on supporting the
 * XQueryX test set provided with the [QT3 test suite](https://dev.w3.org/2011/QT3-test-suite/).
 *
 * Note that the parseScript function returns a detached element: it is not added to the passed
 * document.
 *
 * The element also contains the original expression as a comment.
 *
 * This may later be used for error processing to display the full original script instead of only referring to the AST.
 *
 * @example
 * Parse "self::element" to an XQueryX element and access it
 * ```
 * const xqueryx = parseScript(
 *   'self::element',
 *   {
 *     language: evaluateXPath.XPATH_3_1_LANGUAGE
 *   },
 *   new slimdom.Document()
 * );
 *
 * // Get the nametest element
 * const nameTestElement = evaluateXPathToFirstNode(
 *   'descendant-or-self::Q{http://www.w3.org/2005/XQueryX}nameTest',
 *   xqueryx)
 * ```
 *
 * @public
 *
 * @param script - The script to parse
 *
 * @param options - Additional options for parsing. Can be used to switch between parsing XPath or
 * XQuery update facility
 *
 * @param simpleNodesFactory - A NodesFactory will be used to create the DOM. This can be a
 * reference to the document in which the XQueryX will be created
 *
 * @param documentWriter - The documentWriter will be used to append children to the newly created
 * dom
 */
export default function parseScript<TElement extends Element>(
	script: string,
	options: Options,
	simpleNodesFactory: ISimpleNodesFactory,
	documentWriter: IDocumentWriter = domBackedDocumentWriter
): TElement {
	script = normalizeEndOfLines(script);
	const ast = parseExpression(script, {
		allowXQuery:
			options['language'] === Language.XQUERY_3_1_LANGUAGE ||
			options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
		debug: options.debug,
	});

	if (options.annotateAst) {
		const rootStaticContext = new StaticContext(null);
		const prolog = astHelper.followPath(ast, ['mainModule', 'prolog']);

		if (prolog) {
			processProlog(prolog, rootStaticContext);
		}

		const context = new AnnotationContext(rootStaticContext);
		annotateAst(ast, context);
	}

	const domFacade = new ExternalDomFacade();
	const astAsXML = parseNode(documentWriter, simpleNodesFactory, ast, null) as TElement;
	documentWriter.insertBefore(
		astAsXML,
		simpleNodesFactory.createComment(script),
		domFacade['getFirstChild'](astAsXML)
	);

	return astAsXML;
}
