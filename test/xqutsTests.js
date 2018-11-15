import chai from 'chai';
import {
	evaluateUpdatingExpression,
	evaluateXPath,
	evaluateXPathToAsyncIterator,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	evaluateXPathToString,
	executePendingUpdateList
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
			return sync(xmlString.trim());
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
	const content = fs.readFileSync(path.join('test', 'assets', 'XQUTS-master', filename), 'utf-8');
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

async function runAssertions (expectedErrors, outputFiles, testName, query, args) {
	const failed = [];
	const catchAssertion = assertion => {
		try {
			assertion();
		}
		catch (e) {
			failed.push(e);
		}
	};

	for (const expectedError of expectedErrors) {
		try {
			await assertError(testName, expectedError, query, args);
		}
		catch (e) {
			failed.push(e);
		}
	}

	for (const outputFile of outputFiles) {
		const expectedString = getFile(path.join('ExpectedTestResults', outputFile.file));

		switch (outputFile.compare) {
			case 'XML': {
				const actual = evaluateXPathToFirstNode(...args);
				const expected = actual.nodeType === actual.DOCUMENT_NODE ?
					parser.parseFromString(expectedString) :
					parser.parseFromString(expectedString).documentElement;

				catchAssertion(() => assertXml(actual, expected));
				break;
			}
			case 'Fragment': {
				const actualNodes = evaluateXPathToNodes(...args);

				catchAssertion(() => assertFragment(actualNodes, expectedString));
				break;
			}
			case 'Text': {
				const actual = evaluateXPathToString(...args);
				const actualNodes = [new slimdom.Document().createTextNode(actual)];

				catchAssertion(() => assertFragment(actualNodes, expectedString));
				break;
			}
			default:
				throw new Error('Compare ' + outputFile.compare + ' is not supported.');
		}
	}

	if (failed.length === expectedErrors.length + outputFiles.length) {
		throw new Error(failed.map(e => e.message).join(' or '));
	}
}

async function runTestCase (testName, testCase) {
	const states = evaluateXPathToAsyncIterator(`declare function local:parse-input($state as element())
	{
		if($state/input-file) then(
			for $input in $state/input-file
			return map{
				"file": concat($input, ".xml"),
				"variable": string($input/@variable)
			}
		) else()
	};

	declare function local:parse-output($basePath as xs:string, $state as element())
	{
		if($state/output-file) then(
			for $output in $state/output-file
			return map{
				"file": concat($basePath, $output),
				"compare": string($output/@compare)
			}
		) else()
	};

	let $basePath := string(@FilePath)
	return state!map{
		"query": concat($basePath, query/@name, ".xq"),
		"input-files": array{local:parse-input(.)},
		"output-files": array{local:parse-output($basePath, .)},
		"expected-errors": if(expected-error) then(
				array{for $error in expected-error return string($error)}
			) else (array{})
	}`, testCase, null, null, { language: 'XQuery3.1' });

	const loadedInputFiles = {};

	let entry = await states.next();
	while (!entry.done) {
		const state = entry.value;
		const query = getFile(path.join('Queries', 'XQuery', state.query));
		const variables = {};
		state['input-files'].forEach(inputFile => {
			const xmlDoc = loadedInputFiles[inputFile.file] ||
				(loadedInputFiles[inputFile.file] = parser.parseFromString(getFile(path.join('TestSources', inputFile.file))));
			variables[inputFile.variable] = xmlDoc;
		});
		const outputFiles = state['output-files'];
		const expectedErrors = state['expected-errors'];

		const args = [query, new slimdom.Document(), null, variables, { language: 'XQuery3.1' }];

		try {
			if (expectedErrors.length || outputFiles.length) {
				await runAssertions(expectedErrors, outputFiles, testName, query, args);
			}
			else if (isUpdatingQuery(testName, query)) {
				const it = await evaluateUpdatingExpression(...args);
				executePendingUpdateList(it.pendingUpdateList, null, null, {});
			}
			else {
				throw new Error('A non-updating expression without an expected value is not supported in the test framework.');
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
