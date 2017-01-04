define([
], function (
) {
	'use strict';

	// Format used is JsonML (http://www.jsonml.org/)

	/**
	 * Transform the given JsonML fragment into the corresponding DOM structure, using the given document to
	 * create nodes.
	 *
	 * JsonML is always expected to be a JavaScript structure. If you have a string of JSON, use JSON.parse first.
	 *
	 * @param   {Document}  document  The document to use to create nodes
	 * @param   {JsonML}    jsonml    The JsonML fragment to parse
	 *
	 * @return  {Node}      The root node of the constructed DOM fragment
	 */
	function parseNode (document, jsonml) {
		if (typeof jsonml === 'string') {
			return document.createTextNode(jsonml);
		}

		if (!Array.isArray(jsonml)) {
			throw new TypeError('JsonML element should be an array or string');
		}

		var name = jsonml[0];

		// Processing instructions are not officially part of the JSONML standard,
		// we therefore encode them as elements containing a single text node
		if (/^\?/.test(name)) {
			var target = name.substring(1),
				data = jsonml[1] || '';
			if (jsonml.length > 2 || (typeof data !== 'string')) {
				throw new TypeError('JsonML processing instruction should contain at most a single string');
			}
			return document.createProcessingInstruction(target, data);
		}

		// Comments are not officially part of the JSONML standard,
		// we therefore encode them as elements named '!' containing zero or one text node
		if (name === '!') {
			var comment = jsonml[1] || '';
			if (jsonml.length > 2 || (typeof comment !== 'string')) {
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
			var doctype = document.implementation.createDocumentType(jsonml[1], jsonml[2], jsonml[3]);
			return doctype;
		}

		// Node must be a normal element
		var element = document.createElement(name),
			firstChild = jsonml[1],
			firstChildIndex = 1;
		if ((typeof firstChild === 'object') && !Array.isArray(firstChild)) {
			for (var attributeName in firstChild) {
				element.setAttribute(attributeName, firstChild[attributeName]);
			}
			firstChildIndex = 2;
		}
		// Parse children
		for (var i = firstChildIndex, l = jsonml.length; i < l; ++i) {
			var node = parseNode(document, jsonml[i]);
			element.appendChild(node);
		}

		return element;
	}

	/**
	 * Convenience wrapper for parseNode which will assume the given JsonML represents the document element,
	 * and therefore append the result to the given document.
	 *
	 * @param   {JsonML}    jsonml    The JsonML fragment to parse
	 * @param   {Document}  document  The document to use to create nodes
	 *
	 * @return  {Document}  The given document, with the parse result appended
	 */
	function parse (jsonml, document) {
		var root = parseNode(document, jsonml);

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
	function serialize (node) {
		switch (node.nodeType) {
			case node.TEXT_NODE:
				return node.nodeValue;
			case node.COMMENT_NODE:
				return node.data ? ['!', node.data] : ['!'];
			case node.PROCESSING_INSTRUCTION_NODE:
				return node.data ? ['?' + node.target, node.data] : ['?' + node.target];
			case node.DOCUMENT_TYPE_NODE:
				return ['!DOCTYPE', node.name, node.publicId, node.systemId];
			default:
				// Serialize element
				var jsonml = [node.nodeName];

				if (node.attributes && node.attributes.length) {
					var attributes = {};

					for (var i = 0, l = node.attributes.length; i < l; ++i) {
						var attr = node.attributes[i];
						attributes[attr.name] = attr.value;
					}

					jsonml.push(attributes);
				}

				// Serialize child nodes
				for (var childNode = node.firstChild; childNode; childNode = childNode.nextSibling) {
					jsonml.push(serialize(childNode));
				}

				return jsonml;
		}
	}

	return {
		parse: parse,
		parseNode: parseNode,
		serialize: serialize
	};
});
