import IDocumentWriter from './documentWriter/IDocumentWriter';
import INodesFactory from './nodesFactory/INodesFactory';
import parseExpression from './parsing/parseExpression';
import { Options, Language } from './evaluateXPath';
import { ConcreteNode, ConcreteParentNode } from './domFacade/ConcreteNode';
import DomBackedNodesFactory from './nodesFactory/DomBackedNodesFactory';
import domBackedDocumentWriter from './documentWriter/domBackedDocumentWriter';
import { Element, Node, CharacterData, Text } from './types/Types';

const XQUERYX_UPDATING_NAMESPACE_URI = 'http://www.w3.org/2007/xquery-update-10';

const XQUERYX_NAMESPACE_URI = 'http://www.w3.org/2005/XQueryX';

const PREFERRED_PREFIX_BY_NAMESPACEURI = {
	[XQUERYX_NAMESPACE_URI]: 'xqx',
	[XQUERYX_UPDATING_NAMESPACE_URI]: 'xquf'
};

/**
 * Transform the given JsonML fragment into the corresponding DOM structure, using the given document to
 * create nodes.
 *
 * JsonML is always expected to be a JavaScript structure. If you have a string of JSON, use JSON.parse first.
 *
 * @param   document -  The document to use to create nodes
 * @param   jsonml   -  The JsonML fragment to parse
 *
 * @return  The root node of the constructed DOM fragment
 */
export function parseNode(
	documentWriter: IDocumentWriter,
	nodesFactory: INodesFactory,
	jsonml: any[] | string,
	parentUri: string | null
): Text | Element {
	if (typeof jsonml === 'string') {
		if (jsonml.length === 0) {
			return null;
		}
		return nodesFactory.createTextNode(jsonml);
	}

	if (!Array.isArray(jsonml)) {
		throw new TypeError('JsonML element should be an array or string');
	}

	const name = jsonml[0];
	let namespaceUri: string;
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
			namespaceUri = parentUri || XQUERYX_NAMESPACE_URI;
			break;
		case 'deleteExpr':
		case 'insertExpr':
		case 'renameExpr':
		case 'replaceExpr':
		case 'transformExpr':
			// Elements added in the update facility need to be in a different namespace
			namespaceUri = XQUERYX_UPDATING_NAMESPACE_URI;
			break;
		default:
			namespaceUri = XQUERYX_NAMESPACE_URI;
			break;
	}
	// Node must be a normal element
	const element = nodesFactory.createElementNS(
		namespaceUri,
		PREFERRED_PREFIX_BY_NAMESPACEURI[namespaceUri] + ':' + name
	);
	const firstChild = jsonml[1];
	let firstChildIndex = 1;
	if (typeof firstChild === 'object' && !Array.isArray(firstChild)) {
		for (const attributeName in firstChild) {
			if (firstChild[attributeName] !== null) {
				documentWriter.setAttributeNS(
					element,
					namespaceUri,
					PREFERRED_PREFIX_BY_NAMESPACEURI[namespaceUri] + ':' + attributeName,
					firstChild[attributeName]
				);
			}
		}
		firstChildIndex = 2;
	}
	// Parse children
	for (let i = firstChildIndex, l = jsonml.length; i < l; ++i) {
		const node = parseNode(
			documentWriter,
			nodesFactory,
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
 *   '//Q{http://www.w3.org/2005/XQueryX}nameTest',
 *   xqueryx)
 * ```
 *
 * @public
 *
 * @param script - The script to parse
 * @param options - Additional options for parsing. Can be used to switch between parsing XPath or
 * XQuery update facility
 * @param  nodesFactory - A NodesFactory will be used to create the DOM. This can be a reference to
 * the document in which the XQueryX will be created
 * @param  documentWriter - The documentWrite will be used to append children
 */
export default function parseScript<TElement extends Element>(
	script: string,
	options: Options,
	nodesFactory: INodesFactory,
	documentWriter: IDocumentWriter = domBackedDocumentWriter
): TElement {
	const ast = parseExpression(script, {
		allowXQuery: options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
		debug: options.debug
	});

	return parseNode(documentWriter, nodesFactory, ast, null) as TElement;
}
