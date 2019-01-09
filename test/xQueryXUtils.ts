import {
	evaluateXPath,
	evaluateXPathToBoolean,
	evaluateXPathToNodes
} from 'fontoxpath';
import { parse } from 'fontoxpath/parsing/xPathParser';
import chai from 'chai';
import { sync, slimdom } from 'slimdom-sax-parser';

/**
 * Transform the given JsonML fragment into the corresponding DOM structure, using the given document to
 * create nodes.
 *
 * JsonML is always expected to be a JavaScript structure. If you have a string of JSON, use JSON.parse first.
 *
 * @param   {Document}  document  The document to use to create nodes
 * @param   {JsonML}    ast       The JsonML fragment to parse
 * @param   {?Node}     parent    The parent node if any
 *
 * @return  {Node}      The root node of the constructed DOM fragment
 */
export function parseAst (document, ast, parent) {
	if (typeof ast === 'string' || typeof ast === 'number') {
		return document.createTextNode(ast);
	}

	if (!Array.isArray(ast)) {
		throw new TypeError('JsonML element should be an array or string');
	}

	var name = ast[0];
	let prefix, namespaceUri;
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
	var element = document.createElementNS(namespaceUri, prefix + name),
		firstChild = ast[1],
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
	for (var i = firstChildIndex, l = ast.length; i < l; ++i) {
		var node = parseAst(document, ast[i], element);
		element.appendChild(node);
	}

	return element;
}

export function buildTestCase (testCase, loadXQuery, loadXQueryX, skippableTests, onActualParsed) {
	it(testCase, async function () {
		let xQuery = await loadXQuery();
		if (!xQuery) {
			skippableTests.push(`${testCase},XQuery script could not be found`);
			throw new Error('XQuery script could not be found!');
		}
		xQuery = xQuery.replace(/\r/g, '');

		let jsonMl;
		try {
			jsonMl = parse(xQuery);
		} catch (err) {
			if (err.location) {
				const start = err.location.start.offset;
				skippableTests.push(`${testCase},Parse error`);
				chai.assert.fail('Parse error', 'No parse error', xQuery.substring(0, start) + '[HERE]' + xQuery.substring(start));
			} else {
				skippableTests.push(`${testCase},Parser related error`);
				throw err;
			}
			this.skip();
		}

		const actual = new slimdom.Document();
		try {
			actual.appendChild(parseAst(actual, jsonMl));
		} catch (e) {
			skippableTests.push(`${testCase},Parser resulted in invalid JsonML`);
			throw e;
		}
		actual.normalize();
		onActualParsed(actual);

		let expected;
		try {
			const rawFile = (await loadXQueryX()).replace(/\r/g, '');
			expected = sync(rawFile);
		} catch (e) {
			skippableTests.push(`${testCase},Expected XML could not be parsed`);
			throw e;
		}
		const nonSignificantWhitespace = evaluateXPathToNodes(
			'//*/text()[starts-with(., "&#xA;") and normalize-space(.)=""]',
			expected, null, null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE });
		for (const node of nonSignificantWhitespace) {
			node.parentNode.removeChild(node);
		}

		// Compare contents as a quick fail. Use
		// contents because we can assume that
		// the outer element is the same, but it may contain random attributes we should ignore.

		const actualInnerHtml = new slimdom.XMLSerializer().serializeToString(actual.documentElement.firstElementChild);
		const expectedInnerHtml = new slimdom.XMLSerializer().serializeToString(expected.documentElement.firstElementChild);
		if (actualInnerHtml.replace(/></g, '>\n<') === expectedInnerHtml.replace(/></g, '>\n<')) {
			return;
		}

		if (!evaluateXPathToBoolean('deep-equal($expected, $actual)', null, null, { expected, actual })) {
			try {
				chai.assert.equal(
					new slimdom.XMLSerializer().serializeToString(actual.documentElement).replace(/></g, '>\n<'),
					new slimdom.XMLSerializer().serializeToString(expected.documentElement).replace(/></g, '>\n<'),
					'Expected the XML to be deep-equal');
			} catch (e) {
				skippableTests.push(`${testCase},result was not equal`);

				throw e;
			}
		}
	});
}
