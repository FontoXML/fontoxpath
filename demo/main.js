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

async function rerunXPath () {
	// Clear results from previous run
	log.innerText = '';
	resultText.innerText = '';

	let it;
	try {
		it = await fontoxpath.evaluateXPathToAsyncIterator(
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
		log.innerText = err.message;
		return;
	}

	const raw = [];
	for (let item = await it.next(); !item.done; item = await it.next()) {
		if (item.value instanceof Node) {
			raw.push(item.value.outerHTML);
		}
		else {
			raw.push(item.value);
		}
	}

	resultText.innerText = '[' + raw.map(item => `"${item}"`).join(', ') + ']';

	tryEvaluateToNodes();
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
