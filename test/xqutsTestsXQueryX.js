import {
	evaluateXPathToBoolean
} from 'fontoxpath';

import { parse } from 'fontoxpath/parsing/xPathParser';

import fs from 'fs';

import path from 'path';
import chai from 'chai';

import { sync, slimdom } from 'slimdom-sax-parser';

if (!fs.promises) {
	fs.promises = {
		readFile: fs.readFileSync
	};
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
	if (!(typeof name === 'string')) {
		console.error(name + ' is not a string. In: "' + JSON.stringify(jsonml) + '"');
	}
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

function run () {
	const failingTestCSVPath = path.join('test', 'failingXQUTSXQueryXTestNames.csv');
	const skippableTests = fs.readFileSync(failingTestCSVPath, 'utf-8')
		.split(/[\r\n]/);
	const skippableTestNames = skippableTests.map(result => result.split(',')[0]);

	const baseDir = path.join('test', 'assets', 'XQUTS_current', 'Queries');

	function buildTestCase (testCase, xQueryPath, xQueryXPath) {
		it(testCase, async function () {
			if (!fs.existsSync(xQueryPath)) {
				skippableTests.push(`${testCase},XQuery script could not be found`);
				throw new Error('XQuery script could not be found!');
			}

			const xQuery = await fs.promises.readFile(xQueryPath, 'utf-8');

			let jsonMl;
			try {
				jsonMl = parse(xQuery);
			}
			catch (err) {
				if (err.location) {
					const start = err.location.start.offset;
					skippableTests.push(`${testCase},Parse error`);
					chai.assert.fail('Parse error', 'No parse error', xQuery.substring(0, start) + '[HERE]' + xQuery.substring(start));
				}
				else {
					skippableTests.push(`${testCase},Parser related error`);
					throw err;
				}
				this.skip();
			}

			const rawFile = (await fs.promises.readFile(xQueryXPath, 'utf-8')).replace(/\n\s*</g, '<').replace(/\r/g, '');
			const actual = new slimdom.Document();
			try {
				actual.appendChild(parseNode(actual, jsonMl));
			}
			catch (e) {
				skippableTests.push(`${testCase},Parser resulted in invalid JsonML`);
				throw e;
			}
			actual.normalize();
			actual.documentElement.setAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'xsi:schemaLocation', `http://www.w3.org/2007/xquery-update-10
                                http://www.w3.org/2007/xquery-update-10/xquery-update-10-xqueryx.xsd`);

			let expected;
			try {
				expected = sync(rawFile);
			}
			catch (e) {
				skippableTests.push(`${testCase},Expected XML could not be parsed`);
				throw e;
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
				}
				catch (e) {
					skippableTests.push(`${testCase},result was not equal`);

					throw e;
				}
			}
		});
	}

	function buildTestCases (testPath) {
		const xQueryXPath = path.join(baseDir, 'XQueryX', ...testPath);

		fs.readdirSync(xQueryXPath).forEach(candidate => {
			const candidatePath = path.join(xQueryXPath, candidate);
			if (fs.lstatSync(candidatePath).isDirectory()) {
				testPath.push(candidate);
				describe(candidate, function () {
					buildTestCases(testPath);
				});
				testPath.pop();
			}
			else {
				const testCase = candidate.substring(0, candidate.length - 4);

				if (skippableTestNames.includes(testCase)) {
					it.skip(testCase);
					return;
				}

				const xQueryPath = path.join(baseDir, 'XQuery', ...testPath, testCase + '.xq');
				const xQueryXPath = path.join(baseDir, 'XQueryX', ...testPath, candidate);

				buildTestCase(testCase, xQueryPath, xQueryXPath);
			}
		});
	}

	buildTestCases([]);

	after(() => {
		console.log(`Marking ${skippableTests.length} tests as known to fail`);
		// fs.writeFileSync(failingTestCSVPath, skippableTests.join('\n').trim() + '\n');
	});
}

run();
