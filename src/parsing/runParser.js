// TODO: Remove this file before merging into master
const xPathParserRaw = require('./xPathParser.new');
const parser = /** @type {({xPathParser: {parse:function(!string):?}, SyntaxError:?})} */ ({});
new Function(xPathParserRaw).call(parser);
const { sync, slimdom } = require('slimdom-sax-parser');

const xQuery = `$person:bob/is/not/$dog:henk/*`;

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
	if (typeof jsonml === 'string' || typeof jsonml === 'number') {
		return document.createTextNode(jsonml);
	}

	if (!Array.isArray(jsonml)) {
		throw new TypeError('JsonML element should be an array or string');
	}

	var name = jsonml[0];

	// Node must be a normal element
	var element = document.createElementNS('http://www.w3.org/2005/XQueryX', 'xqx:' + name),
	firstChild = jsonml[1],
	firstChildIndex = 1;
	if ((typeof firstChild === 'object') && !Array.isArray(firstChild)) {
		for (var attributeName in firstChild) {
			if (firstChild[attributeName] !== null) {
				element.setAttributeNS('http://www.w3.org/2005/XQueryX', 'xqx:' + attributeName, firstChild[attributeName]);
			}
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

function printJsonMl (what, indent, n) {
	const filler = Array(indent).fill(' ').join('');
	switch (typeof what) {
		case 'object': {
			if (Array.isArray(what)) {
				return what.map((w, i) => printJsonMl(w, indent + 2, i)).join('\n');
			}
			if (what === null) {
				return filler + what;
			}
			if (n !== 1) {
				console.warn('Attributes at the wrong place!!!');
			}
			return Object.keys(what).map(k => `${filler}⤷${k}: ${what[k] === null ? 'null' : `"${what[k]}"`}`).join('\n');
		}
		default: {
			if (n === 0) {
				return filler + what;
			}
			return filler + '  "' + what + '"';
		}
	}
}

function printXml (document) {
	let depth = 0;
	const elements = document.documentElement.outerHTML.split(/></g);
	elements.forEach(element => {
		let indent;
		let row = '<' + element + '>';
		if (element === elements[0]) {
			row = row.substring(1);
		}
		else if (element === elements[elements.length - 1]) {
			row = row.substring(0, row.length - 1);
		}
		switch (row.search(/<\//g)) {
			case -1:
				indent = Array(depth++).fill('  ').join('');
				break;
			case 0:
				indent = Array(--depth).fill('  ').join('');
				break;
			default:
				indent = Array(depth).fill('  ').join('');
				break;
		}

		console.log(indent + row);
	});
}

let jsonMl;
try {
	jsonMl = parser.xPathParser.parse(xQuery);
}
catch (err) {
	console.log(err);
	if (err.location) {
		const start = err.location.start.offset;
		console.log(xQuery.substring(0, start) + '[HERE]' + xQuery.substring(start));
	}
}

console.log('----------------JsonML----------------');
console.log(printJsonMl(jsonMl, 0, 0));

const document = new slimdom.Document();
document.appendChild(parseNode(document, jsonMl));
document.documentElement.setAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'xsi:schemaLocation', `http://www.w3.org/2005/XQueryX http://www.w3.org/2005/XQueryX/xqueryx.xsd`);

console.log('-----------------XML-----------------');
printXml(document);
