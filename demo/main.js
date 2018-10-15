import * as fontoxpath from '../src/index';

const xmlSource = document.getElementById('xmlSource');
const xmlFile = document.getElementById('xmlFile');
const log = document.getElementById('log');
const resultText = document.getElementById('resultText');
const xpathField = document.getElementById('xpathField');
const allowXQuery = document.getElementById('allowXQuery');

xmlSource.innerText = `<xml>
<herp>Herp</herp>
<derp id="durp">derp</derp>
<hurr durr="durrdurrdurr">durrrrrr</hurr>
</xml>
	`;

const domParser = new DOMParser();

let xmlDoc = domParser.parseFromString(xmlSource.innerText, 'text/xml');
xmlFile.innerHTML = xmlSource.innerText;

function tryEvaluateToNodes () {
	let resultNodes;
	try {
		resultNodes = fontoxpath.evaluateXPathToNodes(
			xpathField.value,
			xmlDoc,
			null,
			null,
			{
				language: allowXQuery.checked ? fontoxpath.evaluateXPath.XQUERY_3_1_LANGUAGE : fontoxpath.evaluateXPath.XPATH_3_1_LANGUAGE
			}
		);
	}
	catch (err) {
		xmlFile.innerText = err.message;
		return false;
	}

	log.innerText = '';
	const text = resultNodes.map(node => node.nodeType === node.TEXT_NODE ? node.textContent : node.outerHTML).join('\n\n');
	resultText.innerText = text;

	const paths = resultNodes.map(
		node => {
			if (!node.ownerDocument ||
				!node.ownerDocument.contains(node)) {
				return 'false()';
			}
			return fontoxpath.evaluateXPathToString(
				'if (not(self::element())) then "false()" else ancestor-or-self::*!("child::*[" || count(preceding-sibling::*) + 1 || "]") => reverse() => string-join("/")',
				node);
		});
	const htmlNodes = paths
		.map(path => fontoxpath.evaluateXPathToFirstNode(path, xmlFile, fontoxpath.domFacade))
		.filter(n => !!n);

	htmlNodes.forEach(node => node.setAttribute('style', 'border: 1px solid red'));
	return true;
}

function rerunXPath () {
	if (tryEvaluateToNodes()) {
		return;
	}
	try {
		const result = fontoxpath.evaluateXPath(xpathField.value, xmlDoc, fontoxpath.domFacade) + '';
		resultText.innerText = result;
	}
	catch (err) {
		log.innerText = 'Error: ' + err.message;
		resultText.innerText = '';
		return;
	}
	log.innerText = '';
}

xmlSource.oninput = xpathField.oninput = _evt => {
	try {
		xmlDoc = domParser.parseFromString(xmlSource.innerText, 'text/xml');
		xmlFile.innerHTML = xmlDoc.documentElement.outerHTML;

		if (fontoxpath.evaluateXPathToBoolean('//parseerror', xmlDoc, fontoxpath.domFacade)) {
			log.innerText = 'Error: invalid XML';
			return;
		}
		rerunXPath();
	}
	catch (_) {
		// Catch all exceptions
	}
};

rerunXPath();
