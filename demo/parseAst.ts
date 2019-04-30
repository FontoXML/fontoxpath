import { IAST } from '../src/parsing/astHelper';
import { Element, Node, Text } from '../src/types/Types';

type DemoDocument = {
	createElementNS: (namespaceURI: string, prefix: string) => DemoElement,
	createTextNode: (data: string) => Text
};

type DemoElement = Element & {
	appendChild: any,
	setAttributeNS: any
};

/**
 * Transform the given JsonML fragment into the corresponding DOM structure, using the given document to
 * create nodes.
 *
 * JsonML is always expected to be a JavaScript structure. If you have a string of JSON, use JSON.parse first.
 *
 * @param   document  The document to use to create nodes
 * @param   ast       The JsonML fragment to parse
 * @param   parent    The parent node if any
 *
 * @return            The root node of the constructed DOM fragment
 */
export function parseAst(document: DemoDocument, ast: IAST, parent?: DemoElement): Node {
	if (typeof ast === 'string' || typeof ast === 'number') {
		return document.createTextNode(ast as string);
	}

	if (!Array.isArray(ast)) {
		throw new TypeError('JsonML element should be an array or string');
	}

	const name = ast[0];
	let prefix: string;
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
			if (parent && parent.prefix === 'xqxuf') {
				// Elements added in the update facility need to be in a different namespace
				prefix = 'xqxuf:';
				namespaceUri = 'http://www.w3.org/2007/xquery-update-10';
			} else {
				prefix = 'xqx:';
				namespaceUri = 'http://www.w3.org/2005/XQueryX';
			}
			break;
		case 'deleteExpr':
		case 'insertExpr':
		case 'renameExpr':
		case 'replaceExpr':
		case 'transformExpr':
			// Elements added in the update facility need to be in a different namespace
			prefix = 'xqxuf:';
			namespaceUri = 'http://www.w3.org/2007/xquery-update-10';
			break;
		default:
			prefix = 'xqx:';
			namespaceUri = 'http://www.w3.org/2005/XQueryX';
			break;
	}

	// Node must be a normal element
	if (!(typeof name === 'string')) {
		console.error(name + ' is not a string. In: "' + JSON.stringify(ast) + '"');
	}
	const element = document.createElementNS(namespaceUri, prefix + name);
	const firstChild = ast[1];
	let firstChildIndex = 1;
	if (typeof firstChild === 'object' && !Array.isArray(firstChild)) {
		for (const attributeName in firstChild) {
			if (firstChild[attributeName] !== null) {
				element.setAttributeNS(
					namespaceUri,
					prefix + attributeName,
					firstChild[attributeName]
				);
			}
		}
		firstChildIndex = 2;
	}
	// Parse children
	for (let i = firstChildIndex, l = ast.length; i < l; ++i) {
		const node = parseAst(document, ast[i] as IAST, element);
		element.appendChild(node);
	}

	return element;
}
