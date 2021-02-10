import * as chai from 'chai';
import {
	evaluateUpdatingExpressionSync,
	evaluateXPath,
	EvaluateXPath,
	evaluateXPathToAsyncIterator,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	evaluateXPathToString,
	executePendingUpdateList,
} from 'fontoxpath';
import * as path from 'path';
import { slimdom, sync } from 'slimdom-sax-parser';
import { getSkippedTests } from 'test-helpers/getSkippedTests';
import testFs from 'test-helpers/testFs';
import { Node, Element } from 'slimdom';

(global as any).atob = function (b64Encoded) {
	return new Buffer(b64Encoded, 'base64').toString('binary');
};

(global as any).btoa = function (str) {
	return new Buffer(str, 'binary').toString('base64');
};

type ExpressionArguments = [
	string,
	any,
	any,
	Object,
	{
		debug?: boolean;
		returnType?: any;
		language?: EvaluateXPath['XPATH_3_1_LANGUAGE'] | EvaluateXPath['XQUERY_3_1_LANGUAGE'];
	}
];

const parser = {
	parseFromString: (xmlString) => {
		try {
			return sync(xmlString.trim());
		} catch (e) {
			console.log(`Error parsing the string ${xmlString}.`, e);
			throw e;
		}
	},
};

const unrunnableTestCases = getSkippedTests('unrunnableXQUTSTestCases.csv');
const unrunnableTestCasesByName = unrunnableTestCases.map((testCase) => testCase.split(',')[0]);

const cachedFiles = Object.create(null);
function getFile(filename) {
	while (filename.includes('..')) {
		const parts = filename.split('/');
		filename = parts
			.slice(0, parts.indexOf('..') - 1)
			.concat(parts.slice(parts.indexOf('..') + 1))
			.join('/');
	}
	if (cachedFiles[filename]) {
		return cachedFiles[filename];
	}
	const content = testFs.readFileSync(path.join('XQUTS', filename));
	return (cachedFiles[filename] = content.replace(/\r\n/g, '\n'));
}

function isUpdatingQuery(testName, query) {
	return true;
}

function executePul(pul, args) {
	executePendingUpdateList(pul, null, null, null);
	const variables = args[3];
	for (const key in variables) {
		if (variables[key].normalize) {
			variables[key].normalize();
		}
	}
}

async function assertError(expectedError, args: ExpressionArguments, isUpdating) {
	let hasThrown = false;
	try {
		if (isUpdating) {
			const it = evaluateUpdatingExpressionSync(...args);
			executePul(it.pendingUpdateList, args);
		} else {
			evaluateXPath(args[0], args[1], args[2], args[3], null, args[4]);
		}
	} catch (e) {
		hasThrown = true;
		chai.assert.match(e.message, new RegExp(expectedError));
	}
	if (!hasThrown) {
		chai.assert.fail(null, null, `Should throw error ${expectedError}.`);
	}
}

function assertXml(actual, expected) {
	actual.normalize();
	expected.normalize();

	const actualOuterHTML =
		actual.nodeType === actual.DOCUMENT_NODE
			? actual.documentElement.outerHTML
			: actual.outerHTML;
	const expectedOuterHTML =
		expected.nodeType === expected.DOCUMENT_NODE
			? expected.documentElement.outerHTML
			: expected.outerHTML;

	// Try fast string compare
	if (actualOuterHTML === expectedOuterHTML) {
		return;
	}

	if (
		evaluateXPathToBoolean('deep-equal($a, $b)', null, null, {
			a: actual,
			b: expected,
		})
	) {
		return;
	}

	// Do comparison on on outer HTML for clear fail message
	chai.assert.equal(actualOuterHTML, expectedOuterHTML);
}

function assertFragment(actualNodes, expectedString) {
	const actual = parser.parseFromString(`<root/>`);
	actualNodes
		.map((node) => (node.cloneNode ? node.cloneNode(true) : actual.createTextNode(node)))
		.forEach((node) => {
			if (node.nodeType === node.DOCUMENT_NODE) {
				node.childNodes.forEach((childNode) =>
					actual.documentElement.appendChild(childNode.cloneNode(true))
				);
			} else {
				actual.documentElement.appendChild(node);
			}
		});

	const expected = parser.parseFromString(`<root>${expectedString}</root>`);

	assertXml(actual, expected);
}

async function runAssertions(expectedErrors, outputFiles, args: ExpressionArguments, isUpdating) {
	const failed = [];
	const catchAssertion = (assertion) => {
		try {
			assertion();
		} catch (e) {
			failed.push(e);
		}
	};

	for (const expectedError of expectedErrors) {
		try {
			await assertError(expectedError, args, isUpdating);
		} catch (e) {
			failed.push(e);
		}
	}

	for (const outputFile of outputFiles) {
		const expectedString = getFile(path.join('ExpectedTestResults', outputFile.file));

		let xdmValue: unknown;
		const runQuery = (returnType: number) => {
			const it = evaluateUpdatingExpressionSync(args[0], args[1], args[2], args[3], {
				...args[4],
				returnType,
			});
			xdmValue = it.xdmValue;
			if (it.pendingUpdateList) {
				executePul(it.pendingUpdateList, args);
			}
			if (Array.isArray(xdmValue)) {
				xdmValue.forEach((nodeValue) => {
					if (nodeValue.normalize) {
						nodeValue.normalize();
					}
				});
			}
			if (typeof xdmValue === 'object' && 'normalize' in xdmValue) {
				(xdmValue as Node).normalize();
			}

			return xdmValue;
		};

		switch (outputFile.compare) {
			case 'XML': {
				const actual = runQuery(evaluateXPath.FIRST_NODE_TYPE) as Node;
				const expected =
					actual.nodeType === actual.DOCUMENT_NODE
						? parser.parseFromString(expectedString)
						: parser.parseFromString(expectedString).documentElement;

				catchAssertion(() => assertXml(actual, expected));
				break;
			}
			case 'Fragment': {
				const actualNodes = runQuery(evaluateXPath.NODES_TYPE) as Node[];

				catchAssertion(() => assertFragment(actualNodes, expectedString));
				break;
			}
			case 'Text': {
				const actual = runQuery(evaluateXPath.STRING_TYPE) as string;
				const actualNodes = [new slimdom.Document().createTextNode(actual)];

				catchAssertion(() => assertFragment(actualNodes, expectedString));
				break;
			}
			default:
				throw new Error('Compare ' + outputFile.compare + ' is not supported.');
		}
	}

	if (failed.length === expectedErrors.length + outputFiles.length) {
		throw new Error(failed.map((e) => e.message).join(' or '));
	}
}

async function runTestCase(testName: string, testCase: Node) {
	const states = evaluateXPathToAsyncIterator(
		`declare function local:parse-input($state as element())
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
	}`,
		testCase,
		null,
		null,
		{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
	);

	const loadedInputFiles = {};

	let entry = await states.next();
	while (!entry.done) {
		const state = entry.value;
		const query = getFile(path.join('Queries', 'XQuery', state.query));
		const variables = {};
		state['input-files'].forEach((inputFile: { file: string; variable: string }) => {
			const xmlDoc =
				loadedInputFiles[inputFile.file] ||
				(loadedInputFiles[inputFile.file] = parser.parseFromString(
					getFile(path.join('TestSources', inputFile.file))
				));
			variables[inputFile.variable] = xmlDoc;
		});
		const outputFiles = state['output-files'];
		const expectedErrors = state['expected-errors'];

		const args: ExpressionArguments = [
			query,
			new slimdom.Document(),
			null,
			variables,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE, returnType: evaluateXPath.STRING_TYPE },
		];

		try {
			const isUpdating = isUpdatingQuery(testName, query);
			if (expectedErrors.length || outputFiles.length) {
				await runAssertions(expectedErrors, outputFiles, args, isUpdating);
			} else if (isUpdating) {
				const it = evaluateUpdatingExpressionSync(...args);
				executePul(it.pendingUpdateList, args);
			} else {
				throw new Error(
					'A non-updating expression without an expected value is not supported in the test framework.'
				);
			}
		} catch (e) {
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

function buildTestCases(testGroup) {
	(evaluateXPathToNodes('test-group | test-case', testGroup) as Element[]).forEach((test) => {
		switch (test.localName) {
			case 'test-group': {
				const groupName = evaluateXPathToString(
					'(@name, string(GroupInfo/title), string(GroupInfo/description))[. != ""][1]',
					test
				);
				describe(groupName, () => buildTestCases(test));
				break;
			}
			case 'test-case': {
				const testName = evaluateXPathToString('(@name, description)[. != ""][1]', test);

				if (unrunnableTestCasesByName.includes(testName)) {
					it.skip(testName);
					return;
				}

				it(testName, async () => runTestCase(testName, test));
				break;
			}
		}
	});
}

const catalog = parser.parseFromString(getFile('XQUTSCatalog.xml'));

describe('xml query update test suite', function () {
	// Especially the CI can be slow, up the timeout to 60s.
	this.timeout(60000);

	buildTestCases(evaluateXPathToFirstNode('/test-suite', catalog));

	after(() => {
		console.log(`Writing a log of ${unrunnableTestCases.length}`);
		testFs.writeFileSync('unrunnableXQUTSTestCases.csv', unrunnableTestCases.join('\n'));
	});
});
