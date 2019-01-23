import * as fontoxpath from '../src/index';
import { IAST } from '../src/parsing/astHelper';
import parseExpression from '../src/parsing/parseExpression';
import { parseAst } from './parseAst';

const allowXQuery = document.getElementById('allowXQuery') as HTMLInputElement;
const allowXQueryUpdateFacility = document.getElementById(
	'allowXQueryUpdateFacility'
) as HTMLInputElement;
const astJsonMl = document.getElementById('astJsonMl');
const astXml = document.getElementById('astXml');
const bucketField = document.getElementById('bucketField');
const log = document.getElementById('log');
const resultText = document.getElementById('resultText');
const updateResult = document.getElementById('updateResult');
const xmlSource = document.getElementById('xmlSource');
const xpathField = document.getElementById('xpathField');

const domParser = new DOMParser();

let xmlDoc: Document;

function setCookie() {
	const source = encodeURIComponent(xmlSource.innerText);
	const xpath = encodeURIComponent(xpathField.innerText);

	document.cookie = `xpath-editor-state=${allowXQuery.checked ? 1 : 0}${
		allowXQueryUpdateFacility.checked ? 1 : 0
	}${source.length}~${source}${xpath};max-age=${60 * 60 * 24 * 7}`;
}

function stringifyJsonMl(what: any, indent: number, n: number) {
	const filler = Array(indent)
		.fill(' ')
		.join('');
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

function indentXml(document: Document): string {
	let depth = 0;
	const elements = document.documentElement.outerHTML.split(/></g);
	const prettiedXml = [];
	elements.forEach(element => {
		let indent: string;
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

function jsonXmlReplacer(_key: string, value: any): any {
	if (value instanceof Attr) {
		const attrString = [];
		if (value.namespaceURI) {
			attrString.push(`Q{${value.namespaceURI}}`);
		}
		attrString.push(value.localName, '="', value.value, '"');
		return attrString.join('');
	}

	return value instanceof Node ? new XMLSerializer().serializeToString(value) : value;
}

async function runUpdatingXQuery(script: string) {
	const result = await fontoxpath.evaluateUpdatingExpression(script, xmlDoc, null, null, {
		debugMode: true,
		disableCache: true
	});

	resultText.innerText = JSON.stringify(result, jsonXmlReplacer, '  ');
	fontoxpath.executePendingUpdateList(result.pendingUpdateList, null, null, null);
	updateResult.innerText = new XMLSerializer().serializeToString(xmlDoc);
}

async function runNormalXPath(script: string, asXQuery: boolean) {
	const raw = [];
	const it = fontoxpath.evaluateXPathToAsyncIterator(script, xmlDoc, null, null, {
		debugMode: true,
		disableCache: true,
		language: asXQuery
			? fontoxpath.evaluateXPath.XQUERY_3_1_LANGUAGE
			: fontoxpath.evaluateXPath.XPATH_3_1_LANGUAGE
	});

	for (let item = await it.next(); !item.done; item = await it.next()) {
		raw.push(item.value);
	}
	resultText.innerText = JSON.stringify(raw, jsonXmlReplacer, '  ');
}

async function rerunXPath() {
	// Clear results from previous run
	astJsonMl.innerText = '';
	astXml.innerText = '';
	log.innerText = '';
	resultText.innerText = '';
	updateResult.innerText = '';

	const xpath = xpathField.innerText;

	try {
		// First try to get the AST as it has a higher change of succeeding
		const ast = parseExpression(xpath, {
			allowXQuery: true,
			debugMode: false
		}) as IAST;
		astJsonMl.innerText = stringifyJsonMl(ast, 0, 0);

		const document = new Document();
		document.appendChild(parseAst(document, ast));
		document.documentElement.setAttributeNS(
			'http://www.w3.org/2001/XMLSchema-instance',
			'xsi:schemaLocation',
			`http://www.w3.org/2005/XQueryX http://www.w3.org/2005/XQueryX/xqueryx.xsd`
		);
		document.normalize();

		const prettiedXml = indentXml(document);
		astXml.innerText = prettiedXml;
		(window as any).hljs.highlightBlock(astXml);

		if (allowXQueryUpdateFacility.checked) {
			await runUpdatingXQuery(xpath);
		} else {
			await runNormalXPath(xpath, allowXQuery.checked);
		}

		(window as any).hljs.highlightBlock(resultText);
		(window as any).hljs.highlightBlock(updateResult);
	} catch (err) {
		let errorMessage = err.message;
		if (err.location) {
			const start = err.location.start.offset;
			errorMessage += '\n\n' + xpath.substring(0, start) + '[HERE]' + xpath.substring(start);
		}

		log.innerText = errorMessage;
		return;
	}

	bucketField.innerText = allowXQuery.checked
		? 'Buckets can not be used in XQuery'
		: fontoxpath.getBucketForSelector(xpath);
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
	} catch (_) {
		// Catch all exceptions
	}
};

function loadFromCookie() {
	const cookie = document.cookie.split(/;\s/g).find(c => c.startsWith('xpath-editor-state='));

	if (!cookie) {
		xmlSource.innerText = `<xml>
	<herp>Herp</herp>
	<derp id="durp">derp</derp>
	<hurr durr="durrdurrdurr">durrrrrr</hurr>
</xml>`;
		(window as any).hljs.highlightBlock(xmlSource);
		return;
	}

	const headerPartLength = 'xpath-editor-state='.length;
	const firstPart = cookie.match(/^xpath-editor-state=(\d+)~/)[1];
	// The first two characters are actually the state of the xquery and xquf checkboxes
	allowXQuery.checked = firstPart[0] === '1';

	allowXQueryUpdateFacility.checked = firstPart[1] === '1';

	const sourceLengthString = firstPart.substring(2);

	const sourceStart = headerPartLength + firstPart.length + 1;
	const sourceLength = parseInt(sourceLengthString, 10);
	const source = cookie.substring(sourceStart, sourceStart + sourceLength);

	xmlSource.innerText = decodeURIComponent(source);
	(window as any).hljs.highlightBlock(xmlSource);
	xmlDoc = domParser.parseFromString(decodeURIComponent(source), 'text/xml');

	const xpathStartOffset = sourceStart + sourceLength;
	xpathField.innerText = decodeURIComponent(cookie.substring(xpathStartOffset));
}

loadFromCookie();

rerunXPath();
