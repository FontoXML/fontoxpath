import chai from 'chai';
import {
	evaluateUpdatingExpression,
	evaluateXPath,
	evaluateXPathToArray,
	evaluateXPathToAsyncIterator,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
	executePendingUpdateList,
	registerXQueryModule
} from 'fontoxpath';
import { parse } from 'fontoxpath/parsing/xPathParser';
import { parseAst } from './xQueryXUtils';
import fs from 'fs';
import path from 'path';
import mocha from 'mocha';
import { sync, slimdom } from 'slimdom-sax-parser';

global.atob = function (b64Encoded) {
	return new Buffer(b64Encoded, 'base64').toString('binary');
};

global.btoa = function (str) {
	return new Buffer(str, 'binary').toString('base64');
};

const parser = {
	parseFromString: xmlString => {
		try {
			return sync(xmlString);
		}
		catch (e) {
			console.log(`Error parsing the string ${xmlString}.`, e);
			throw e;
		}
	}
};

// Especially the CI can be slow, up the timeout to 60s.
if (typeof mocha !== 'undefined' && mocha.timeout) {
	mocha.timeout(60000);
}

const unrunnableTestCases = fs.readFileSync(path.join('test', 'unrunnableXQUTSTestCases.csv'), 'utf-8')
	.split(/\r?\n/).filter(row => row);
const unrunnableTestCasesByName = unrunnableTestCases
	.map(testCase => testCase.split(',')[0]);

const cachedFiles = Object.create(null);
function getFile (filename) {
	while (filename.includes('..')) {
		const parts = filename.split('/');
		filename = parts.slice(0, parts.indexOf('..') - 1).concat(parts.slice(parts.indexOf('..') + 1)).join('/');
	}
	if (cachedFiles[filename]) {
		return cachedFiles[filename];
	}
	const content = fs.readFileSync(path.join('test', 'assets', 'XQUTS_current', filename), 'utf-8');
	return cachedFiles[filename] = content.replace(/\r\n/g, '\n');
}

function isUpdatingQuery (testName, query) {
	const ast = parse(query);
	const doc = new slimdom.Document();
	try {
		doc.appendChild(parseAst(doc, ast));
	}
	catch (e) {
		unrunnableTestCases.push(`${testName},Parser resulted in invalid JsonML`);
		throw e;
	}
	return evaluateXPathToBoolean(
		'declare namespace xqxuf="http://www.w3.org/2007/xquery-update-10"; exists(//xqxuf:*)', doc,
		null, null, { language: 'XQuery3.1' }
	);
}

async function assertError (testName, expectedError, query, args) {
	let hasThrown = false;
	try {
		const _ = isUpdatingQuery(testName, query) ?
			await evaluateUpdatingExpression(...args) :
			evaluateXPath(...args.slice(0, args.length - 1), null, { language: 'XQuery3.1' });
	}
	catch (e) {
		hasThrown = true;
		if (!e.message.startsWith(expectedError === '*' ? '' : expectedError)) {
			chai.assert.equal(e.message, expectedError, `Should throw error ${expectedError}.`);
		}
	}
	if (!hasThrown) {
		chai.assert.fail(null, null, `Should throw error ${expectedError}.`);
	}
}

function assertXml (actual, expected) {
	actual = actual.cloneNode(true);
	actual.normalize();
	expected.normalize();

	const actualOuterHTML = actual.nodeType === actual.DOCUMENT_NODE ? actual.documentElement.outerHTML : actual.outerHTML;
	const expectedOuterHTML = expected.nodeType === expected.DOCUMENT_NODE ? expected.documentElement.outerHTML : expected.outerHTML;

	// Try fast string compare
	if (actualOuterHTML === expectedOuterHTML) {
		return;
	}

	if (evaluateXPathToBoolean('deep-equal($a, $b)', null, null, {
		a: actual,
		b: expected
	})) {
		return;
	}

	// Do comparison on on outer HTML for clear fail message
	chai.assert.equal(actualOuterHTML, expectedOuterHTML);
}

function assertFragment (actualNodes, expectedString) {
	const actual = parser.parseFromString(`<root/>`);
	actualNodes.map(node => node.cloneNode(true)).forEach(node => actual.documentElement.appendChild(node.nodeType === node.DOCUMENT_NODE ? node.documentElement : node));

	const expected = parser.parseFromString(`<root>${expectedString}</root>`);

	assertXml(actual, expected);
}

async function runTestCase (testName, testCase) {
	const states = evaluateXPathToAsyncIterator(`let $basePath := @FilePath
	return state!map{
		"query": concat($basePath, query/@name, ".xq"),
		"input-file": if(input-file) then(map{
			"file": concat(input-file, ".xml"),
			"variable": string(input-file/@variable)
		}) else (),
		"output-file": if(output-file) then(map{
			"file": concat($basePath, output-file),
			"compare": string(output-file/@compare)
		}) else (),
		"expected-error": if(expected-error) then(string(expected-error)) else ()
	}`, testCase);

	const inputFiles = {};

	let entry = await states.next();
	while (!entry.done) {
		const state = entry.value;
		const query = getFile(path.join('Queries', 'XQuery', state.query));
		const inputFile = state['input-file'];
		let contextNode;
		const variables = {};
		if (inputFile) {
			contextNode = inputFiles[inputFile.file] || (inputFiles[inputFile.file] = parser.parseFromString(getFile(path.join('TestSources', inputFile.file))));
			variables[[inputFile.variable]] = contextNode;
		}
		const outputFile = state['output-file'];
		const expectedError = state['expected-error'];

		const args = [query, contextNode, null, variables, { language: 'XQuery3.1' }];

		try {
			if (expectedError) {
				await assertError(testName, expectedError, query, args);
			}
			else if (outputFile) {
				if (isUpdatingQuery(testName, query)) {
					throw new Error('An updating expression is not supported in the test framework with an expected value.');
				}

				const expectedString = getFile(path.join('ExpectedTestResults', outputFile.file));

				switch (outputFile.compare) {
					case 'XML': {
						const actual = evaluateXPathToFirstNode(...args);
						const expected = actual.nodeType === actual.DOCUMENT_NODE ?
							parser.parseFromString(expectedString) :
							parser.parseFromString(expectedString).documentElement;

						assertXml(actual, expected);
						break;
					}
					case 'Fragment': {
						const actualNodes = evaluateXPathToNodes(...args);

						assertFragment(actualNodes, expectedString);
						break;
					}
					case 'Text': {
						const actual = evaluateXPathToString(...args);
						const actualNodes = [new slimdom.Document().createTextNode(actual)];

						assertFragment(actualNodes, expectedString);
						break;
					}
					default:
						throw new Error('Compare ' + outputFile.compare + ' is not supported.');
				}
			}
			else if (isUpdatingQuery(testName, query)) {
				const it = await evaluateUpdatingExpression(...args);
				executePendingUpdateList(it.pendingUpdateList, null, null, {});
			}
			else {
				throw new Error('A non-updating expression is not supported in the test framework without an expected value.');
			}
		}
		catch (e) {
			if (e instanceof TypeError) {
				throw e;
			}

			unrunnableTestCases.push(`${testName},${e.toString().replace(/\r?\n/g, ' ').trim()}`);

			// And rethrow the error
			throw e;
		}

		entry = await states.next();
	}
}

function buildTestCases (testGroup) {
	evaluateXPathToNodes('test-group | test-case', testGroup).forEach(test => {
		switch (test.localName) {
			case 'test-group': {
				const groupName = evaluateXPathToString('(@name, string(GroupInfo/title), string(GroupInfo/description))[. != ""][1]', test);
				describe(groupName, () => buildTestCases(test));
				break;
			}
			case 'test-case': {
				const testName = evaluateXPathToString('(@name, description)[. != ""][1]', test);

				if (unrunnableTestCasesByName.includes(testName)) {
					it.skip(testName);
					return;
				}

				it(testName, async () => await runTestCase(testName, test));
				break;
			}
		}
	});
}

const catalog = parser.parseFromString(getFile('XQUTSCatalog.xml'));

describe('xml query update test suite', () => {
	buildTestCases(evaluateXPathToFirstNode('/test-suite', catalog));

	after(() => {
		console.log(`Writing a log of ${unrunnableTestCases.length}`);
		fs.writeFileSync('./test/unrunnableXQUTSTestCases.csv', unrunnableTestCases.join('\n'));
	});
});
