import * as fontoxpath from '../src/index';
import * as parser from '../src/parsing/xPathParser';

const xmlSource = document.getElementById('xmlSource');
const log = document.getElementById('log');
const resultText = document.getElementById('resultText');
const xpathField = document.getElementById('xpathField');
const allowXQuery = document.getElementById('allowXQuery');
const allowXQueryUpdateFacility = document.getElementById('allowXQueryUpdateFacility');
const bucketField = document.getElementById('bucketField');
const astJsonMl = document.getElementById('astJsonMl');
const astXml = document.getElementById('astXml');

const domParser = new DOMParser();

let xmlDoc;

function setCookie () {
	const source = encodeURIComponent(xmlSource.innerText);
	const xpath = encodeURIComponent(xpathField.innerText);

	document.cookie = `xpath-editor-state=${allowXQuery.checked ? 1 : 0}${allowXQueryUpdateFacility.checked ? 1 : 0}${source.length}~${source}${xpath};max-age=${60 * 60 * 24 * 7}`;
}

function stringifyJsonMl (what, indent, n) {
	const filler = Array(indent).fill(' ').join('');
	switch (typeof what) {
		case 'object': {
			if (Array.isArray(what)) {
				return what.map((w, i) => stringifyJsonMl(w, indent + 2, i)).join('\n');
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
	let prefix, namespaceUri;
	switch (name) {
		case 'replaceExpr':
		case 'replacementExpr':
		case 'replaceValue':
		case 'targetExpr':
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
	var element = document.createElementNS(namespaceUri, prefix + name),
	firstChild = jsonml[1],
	firstChildIndex = 1;
	if ((typeof firstChild === 'object') && !Array.isArray(firstChild)) {
		for (var attributeName in firstChild) {
			if (firstChild[attributeName] !== null) {
				element.setAttributeNS(namespaceUri, prefix + attributeName, firstChild[attributeName]);
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

function indentXml (document) {
	let depth = 0;
	const elements = document.documentElement.outerHTML.split(/></g);
	const prettiedXml = [];
	elements.forEach(element => {
		let indent;
		let row = '<' + element + '>';
		if (element === elements[0]) {
			row = row.substring(1);
		}
		else if (element === elements[elements.length - 1]) {
			row = row.substring(0, row.length - 1);
		}

		if (row.substring(row.length - 2) === '/>') {
			indent = Array(depth).fill('  ').join('');
		}
		else {
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
		}

		prettiedXml.push(indent + row + '\n');
	});
	return prettiedXml.join('');
}

async function rerunXPath () {
	// Clear results from previous run
	log.innerText = '';
	resultText.innerText = '';
	astJsonMl.innerText = '';
	astXml.innerText = '';

	const xpath = xpathField.innerText;

	const raw = [];
	try {
		// First try to get the AST as it has a higher change of succeeding
		const ast = parser.parse(xpath);
		astJsonMl.innerText = stringifyJsonMl(ast, 0, 0);

		const document = new Document();

		// const document = new slimdom.Document();
		document.appendChild(parseNode(document, ast));
		document.documentElement.setAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'xsi:schemaLocation', `http://www.w3.org/2005/XQueryX http://www.w3.org/2005/XQueryX/xqueryx.xsd`);
		document.normalize();

		const prettiedXml = indentXml(document);
		astXml.innerText = prettiedXml;

		const it = await fontoxpath.evaluateUpdatingExpression(
			xpath,
			xmlDoc,
			null,
			null,
			{
				disableCache: true,
			}
		);

		for (let item = await it.next(); !item.done; item = await it.next()) {
			raw.push(item.value instanceof Node ? new XMLSerializer().serializeToString(item.value) : item.value);
		}
	}
	catch (err) {
		log.innerText = err.message;
		return;
	}

	resultText.innerText = '[' + raw.map(item => `"${item}"`).join(', ') + ']';

	bucketField.innerText = allowXQuery.checked ? 'Buckets can not be used in XQuery' : fontoxpath.getBucketForSelector(xpath);
}

xmlSource.oninput = _evt => {
	xmlDoc = domParser.parseFromString(xmlSource.innerText, 'text/xml');
	setCookie();
	if (fontoxpath.evaluateXPathToBoolean('//parseerror', xmlDoc, fontoxpath.domFacade)) {
		log.innerText = 'Error: invalid XML';
		return;
	}

	rerunXPath();
};

xpathField.oninput = _evt => {
	setCookie();
	try {
		xmlDoc = domParser.parseFromString(xmlSource.innerText, 'text/xml');

		rerunXPath();
	}
	catch (_) {
		// Catch all exceptions
	}
};

function loadFromCookie () {
	const cookie = document.cookie.split(/;\s/g).find(cookie => cookie.startsWith('xpath-editor-state='));

	if (!cookie) {
		xmlSource.innerText = `<xml>
	<herp>Herp</herp>
	<derp id="durp">derp</derp>
	<hurr durr="durrdurrdurr">durrrrrr</hurr>
</xml>`;
		return;
	}

	const headerPartLength = 'xpath-editor-state='.length;
	const firstPart = cookie.match(/^xpath-editor-state=(\d+)~/)[1];
	// The first two characters are actually the state of the xquery and xquf checkboxes
	allowXQuery.checked = firstPart[0] === '1';

	allowXQueryUpdateFacility.checked = firstPart[1] === '1';

	var sourceLengthString = firstPart.substring(2);

	const sourceStart = headerPartLength + firstPart.length + 1;
	const sourceLength = parseInt(sourceLengthString, 10);
	const source = cookie.substring(sourceStart, sourceStart + sourceLength);

	xmlSource.innerText = decodeURIComponent(source);
	xmlDoc = domParser.parseFromString(decodeURIComponent(source), 'text/xml');

	const xpathStartOffset = sourceStart + sourceLength;
	xpathField.innerText = decodeURIComponent(cookie.substring(xpathStartOffset));
}

loadFromCookie();

rerunXPath();
