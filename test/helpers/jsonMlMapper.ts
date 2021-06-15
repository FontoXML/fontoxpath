import {
	Comment,
	Document,
	DocumentType,
	Element,
	Node,
	ProcessingInstruction,
	Text,
} from 'slimdom';

// Format used is JsonML (http://www.jsonml.org/)

interface JsonML extends Array<string | { [key: string]: string } | JsonML> {
	0: string;
}

/**
 * Transform the given JsonML fragment into the corresponding DOM structure, using the given document to
 * create nodes.
 *
 * JsonML is always expected to be a JavaScript structure. If you have a string of JSON, use JSON.parse first.
 *
 * @param   document  The document to use to create nodes
 * @param   jsonml    The JsonML fragment to parse
 *
 * @return  The root node of the constructed DOM fragment
 */
function parseNode(document: Document, jsonml: JsonML | string): Node {
	if (typeof jsonml === 'string') {
		return document.createTextNode(jsonml);
	}

	if (!Array.isArray(jsonml)) {
		throw new TypeError('JsonML element should be an array or string');
	}

	const name = jsonml[0];

	// Processing instructions are not officially part of the JSONML standard,
	// we therefore encode them as elements containing a single text node
	if (/^\?/.test(name)) {
		const target = name.substring(1);
		const data = jsonml[1] || '';
		if (jsonml.length > 2 || typeof data !== 'string') {
			throw new TypeError(
				'JsonML processing instruction should contain at most a single string'
			);
		}
		return document.createProcessingInstruction(target, data);
	}

	// Comments are not officially part of the JSONML standard,
	// we therefore encode them as elements named '!' containing zero or one text node
	if (name === '!') {
		const comment = jsonml[1] || '';
		if (jsonml.length > 2 || typeof comment !== 'string') {
			throw new TypeError('JsonML comment should contain at most a single string');
		}
		return document.createComment(comment);
	}

	// Document types are not officially part of the JSONML standard,
	// we therefore encode them as elements named '!DOCTYPE' containing three text nodes
	if (name.toUpperCase() === '!DOCTYPE') {
		if (jsonml.length !== 4) {
			throw new TypeError('JsonML doctype should contain three strings');
		}
		const doctype = document.implementation.createDocumentType(
			jsonml[1] as string,
			jsonml[2] as string,
			jsonml[3] as string
		);
		return doctype;
	}

	// Node must be a normal element
	const element = document.createElement(name);
	const firstChild = jsonml[1];
	let firstChildIndex = 1;
	if (typeof firstChild === 'object' && !Array.isArray(firstChild)) {
		for (const attributeName in firstChild) {
			if (firstChild[attributeName] !== null) {
				element.setAttribute(attributeName, firstChild[attributeName]);
			}
		}
		firstChildIndex = 2;
	}
	// Parse children
	for (let i = firstChildIndex, l = jsonml.length; i < l; ++i) {
		const node = parseNode(document, jsonml[i] as JsonML | string);
		element.appendChild(node);
	}

	return element;
}

/**
 * Convenience wrapper for parseNode which will assume the given JsonML represents the document element,
 * and therefore append the result to the given document.
 *
 * @param   jsonml    The JsonML fragment to parse
 * @param   document  The document to use to create nodes
 *
 * @return  The given document, with the parse result appended
 */
function parse(jsonml: JsonML | string, document: Document): Document {
	const root = parseNode(document, jsonml);

	document.appendChild(root);

	return document;
}

/**
 * Creates a JsonML representation for the given DOM fragment.
 *
 * JsonML is always expected to be a JavaScript structure. If you need a string of JSON, use JSON.stringify
 * afterwards.
 *
 * As Document nodes are not supported in JsonML, pass Document.documentElement if you need the JsonML
 * representation of a complete document, otherwise Document will be represented as an element with
 * undefined nodeName.
 *
 * @param   {Node}  node  Root node of the structure to convert.
 *
 * @return  {JsonML}
 */
function serialize(node: Node): JsonML | string {
	switch (node.nodeType) {
		case Node.TEXT_NODE:
			return (node as Text).nodeValue;
		case Node.COMMENT_NODE:
			return (node as Comment).data ? ['!', (node as Comment).data] : ['!'];
		case Node.PROCESSING_INSTRUCTION_NODE:
			return (node as ProcessingInstruction).data
				? [
						'?' + (node as ProcessingInstruction).target,
						(node as ProcessingInstruction).data,
				  ]
				: ['?' + (node as ProcessingInstruction).target];
		case Node.DOCUMENT_TYPE_NODE:
			return [
				'!DOCTYPE',
				(node as DocumentType).name,
				(node as DocumentType).publicId,
				(node as DocumentType).systemId,
			];
		default:
			// Serialize element
			const jsonml = [node.nodeName] as JsonML;

			if ((node as Element).attributes && (node as Element).attributes.length) {
				const attributes: { [key: string]: string } = {};

				for (let i = 0, l = (node as Element).attributes.length; i < l; ++i) {
					const attr = (node as Element).attributes[i];
					attributes[attr.name] = attr.value;
				}

				jsonml[1] = attributes;
			}

			// Serialize child nodes
			for (
				let childNode: Node = (node as Element).firstChild;
				childNode;
				childNode = childNode.nextSibling
			) {
				jsonml.push(serialize(childNode));
			}

			return jsonml;
	}
}
export default {
	parse,
	parseNode,
	serialize,
};
