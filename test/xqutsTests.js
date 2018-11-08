import chai from 'chai';
import {
	evaluateUpdatingExpression,
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
import fs from 'fs';
import path from 'path';
import mocha from 'mocha';
import { sync } from 'slimdom-sax-parser';

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

async function runTestCase (testName, testCase) {
	const states = evaluateXPathToAsyncIterator(`let $basePath := @FilePath
	return state!map{
		"query": concat($basePath, query/@name, ".xq"),
		"input-file": map{
			"file": concat(input-file, ".xml"),
			"variable": string(input-file/@variable)
		},
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
		const xmlDoc = inputFiles[inputFile.file] || (inputFiles[inputFile.file] = parser.parseFromString(getFile(path.join('TestSources', inputFile.file))));
		const variable = inputFile.variable;

		const expectedFile = state['output-file'] ? getFile(path.join('ExpectedTestResults', state['output-file'].file)) : null;
		const expectedError = state['expected-error'];

		function isUpdating (q) {
			return q.includes('return replace node ');
		}

		let actual;
		const execution = isUpdating(query) ? async () => {
			const it = await evaluateUpdatingExpression(query, xmlDoc, null, { [variable]: xmlDoc }, {});
			executePendingUpdateList(it.pendingUpdateList, null, null, {});
		} : async () => {
			actual = evaluateXPathToFirstNode(query, xmlDoc, null, { [variable]: xmlDoc }, {});
		};

		try {
			if (expectedError) {
				chai.assert.throws(async () => await execution,
				expectedError === '*' ? '' : expectedError, `Should throw error ${expectedError}.`);
			}
			else {
				await execution();
			}

			if (expectedFile) {
				const expectedDoc = parser.parseFromString(expectedFile);

				// Wrap actual and expected in a root element allowing deep-equal comparison
				const compareDoc = parser.parseFromString('<compare><actual/><expected/></compare>', 'text/xml');
				evaluateXPathToFirstNode('compare/actual', compareDoc).appendChild(actual || xmlDoc.documentElement);
				evaluateXPathToFirstNode('compare/expected', compareDoc).appendChild(expectedDoc.documentElement);
				chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(compare/actual, compare/expected)', compareDoc),
				'Expected and actual are not equal.');
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
	// (test-case/@name, string(test-case/description))[1]
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
		// fs.writeFileSync('./test/unrunnableXQUTSTestCases.csv', unrunnableTestCases.join('\n'));
	});
});
