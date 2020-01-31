/**
 * This script can be used to quickly get the AST build through using xpath.pegjs. This outputs the
 * AST in JsonML and XQueryX format. The is mainly useful to use for debugging changes in
 * xpath.pegjs as it does not require a rebuild of fontoxpath.
 *
 * You can change the value of `const xQuery` to parse another XQuery snippet.
 */

// tslint:disable:no-console
import * as fs from 'fs';
import * as path from 'path';
import * as peg from 'pegjs';
import * as slimdom from 'slimdom';

const parserString = fs.readFileSync(path.join('src', 'parsing', 'xpath.pegjs'), 'utf-8');
const parser = peg.generate(parserString);

const xQuery = `(/descendant::test-case/map:entry(@name, (test/@file/string(), test/string())[1])) => map:merge()`;

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
function parseNode(document, jsonml) {
	if (typeof jsonml === 'string' || typeof jsonml === 'number') {
		return document.createTextNode(jsonml);
	}

	if (!Array.isArray(jsonml)) {
		throw new TypeError('JsonML element should be an array or string');
	}

	const name = jsonml[0];

	// Node must be a normal element
	const element = document.createElementNS('http://www.w3.org/2005/XQueryX', 'xqx:' + name);
	const firstChild = jsonml[1];
	let firstChildIndex = 1;
	if (typeof firstChild === 'object' && !Array.isArray(firstChild)) {
		for (const attributeName in firstChild) {
			if (firstChild[attributeName] !== null) {
				element.setAttributeNS(
					'http://www.w3.org/2005/XQueryX',
					'xqx:' + attributeName,
					firstChild[attributeName]
				);
			}
		}
		firstChildIndex = 2;
	}
	// Parse children
	for (let i = firstChildIndex, l = jsonml.length; i < l; ++i) {
		const node = parseNode(document, jsonml[i]);
		element.appendChild(node);
	}

	return element;
}

function printJsonMl(what, indent, n) {
	const filler = Array(indent)
		.fill(' ')
		.join('');
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
			return Object.keys(what)
				.map(k => `${filler}⤷${k}: ${what[k] === null ? 'null' : `"${what[k]}"`}`)
				.join('\n');
		}
		default: {
			if (n === 0) {
				return filler + what;
			}
			return filler + '  "' + what + '"';
		}
	}
}

function printXml(document) {
	let depth = 0;
	const elements = document.documentElement.outerHTML.split(/></g);
	const prettiedXml = [];
	elements.forEach(element => {
		let indent;
		let row = '<' + element + '>';
		if (element === elements[0]) {
			row = row.substring(1);
		} else if (element === elements[elements.length - 1]) {
			row = row.substring(0, row.length - 1);
		}

		if (row.substring(row.length - 2) === '/>') {
			indent = Array(depth)
				.fill('  ')
				.join('');
		} else {
			switch (row.search(/<\//g)) {
				case -1:
					indent = Array(depth++)
						.fill('  ')
						.join('');
					break;
				case 0:
					indent = Array(--depth)
						.fill('  ')
						.join('');
					break;
				default:
					indent = Array(depth)
						.fill('  ')
						.join('');
					break;
			}
		}

		prettiedXml.push(indent + row + '\n');
	});
	return prettiedXml.join('');
}

try {
	const jsonMl = parser.parse(xQuery);

	console.log('----------------JsonML----------------');
	console.log(printJsonMl(jsonMl, 0, 0));

	const document = new slimdom.Document();
	document.appendChild(parseNode(document, jsonMl));
	document.documentElement.setAttributeNS(
		'http://www.w3.org/2001/XMLSchema-instance',
		'xsi:schemaLocation',
		`http://www.w3.org/2005/XQueryX http://www.w3.org/2005/XQueryX/xqueryx.xsd`
	);

	document.normalize();

	console.log('-----------------XML-----------------');
	const prettiedXml = printXml(document);
	console.log(prettiedXml);
	console.log(document.documentElement.outerHTML);
} catch (err) {
	console.log(err);
	if (err.location) {
		const start = err.location.start.offset;
		console.log(xQuery.substring(0, start) + '[HERE]' + xQuery.substring(start));
	}
}
