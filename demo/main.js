import * as fontoxpath from '../src/index';

const xmlSource = document.getElementById('xmlSource');
const log = document.getElementById('log');
const resultText = document.getElementById('resultText');
const xpathField = document.getElementById('xpathField');
const allowXQuery = document.getElementById('allowXQuery');


const domParser = new DOMParser();

let xmlDoc;

function setCookie () {
	const source = encodeURIComponent(xmlSource.innerText);
	const xpath = encodeURIComponent(xpathField.value);

	document.cookie = `xpath-editor-state=${source.length}~${source}${xpath};max-age=${60*60*24*7}`;
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
				disableCache: true,
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
			switch (item.value.nodeType) {
				case 2: // Attribute
					raw.push(`${item.value.nodeName}="${item.value.nodeValue}"`);
					break;
				default:
					raw.push(item.value.outerHTML);
					break;
			}
		}
		else {
			raw.push(item.value);
		}
	}

	resultText.innerText = '[' + raw.map(item => `"${item}"`).join(', ') + ']';
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
	const sourceLengthString = cookie.match(/^xpath-editor-state=(\d+)~/)[1];
	const sourceStart = headerPartLength + sourceLengthString.length + 1;
	const sourceLength = parseInt(sourceLengthString, 10);
	const source = cookie.substring(sourceStart, sourceStart + sourceLength);

	xmlSource.innerText = decodeURIComponent(source);
	xmlDoc = domParser.parseFromString(decodeURIComponent(source), 'text/xml');

	const xpathStartOffset = sourceStart + sourceLength;
	xpathField.value = decodeURIComponent(cookie.substring(xpathStartOffset));
}

loadFromCookie();

rerunXPath();
