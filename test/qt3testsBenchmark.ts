import { Suite } from 'benchmark';

import {
	Document,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
	Language,
} from 'fontoxpath';

import { Element, Node } from 'slimdom';
import getPerformanceTests from 'test-helpers/getPerformanceTests';
import { ALL_TESTS_QUERY, getAllTestSets, getArguments, getFile } from 'test-helpers/qt3TestsTools';

const suite: Suite = new Suite();

function addTests(functions) {
	Object.keys(functions).forEach((name) => {
		suite.add(name, functions[name]);
	});
}

function runTests() {
	// tslint:disable-next-line: no-console
	console.log('Tests are running...');
	suite
		// add listeners
		.on('cycle', (event) => {
			// tslint:disable-next-line: no-console
			console.log(
				`${event.target.name}, ${Math.round(event.target.hz * 1000) / 1000} op/sec, ±${
					Math.round(event.target.stats.rme * 1000) / 1000
				}%, ${event.target.stats.sample.length} runs sampled`
			);
		})
		.run({ async: true });
}

function addTestCaseToBenchmark(
	assertNode: Element,
	language: Language,
	xpath: string,
	contextNode: Node | undefined,
	variablesInScope: {},
	namespaceResolver: (prefix: string) => string | null,
	name: string
): void {
	const nodesFactory = {
		createAttributeNS: assertNode.ownerDocument.createAttributeNS.bind(
			assertNode.ownerDocument
		),
		createCDATASection: assertNode.ownerDocument.createCDATASection.bind(
			assertNode.ownerDocument
		),
		createComment: assertNode.ownerDocument.createComment.bind(assertNode.ownerDocument),
		createDocument: assertNode.ownerDocument.implementation.createDocument.bind(
			assertNode.ownerDocument
		),
		createElementNS: assertNode.ownerDocument.createElementNS.bind(assertNode.ownerDocument),
		createProcessingInstruction: assertNode.ownerDocument.createProcessingInstruction.bind(
			assertNode.ownerDocument
		),
		createTextNode: assertNode.ownerDocument.createTextNode.bind(assertNode.ownerDocument),
	};

	switch (assertNode.localName) {
		// In the tests of 'all-of' and 'any-of', there should be multiple tests. That's why
		// function names are numbered.
		case 'all-of':
		case 'any-of': {
			const innerAssertNodes: Element[] = evaluateXPathToNodes('*', assertNode);
			innerAssertNodes.forEach((innerAssertNode, i) =>
				addTestCaseToBenchmark(
					innerAssertNode,
					language,
					xpath,
					contextNode,
					variablesInScope,
					namespaceResolver,
					`${name}-${i}`
				)
			);
			break;
		}

		case 'assert': {
			addTests({
				[name]: () =>
					evaluateXPathToBoolean(
						`let $result := (${xpath}) return ${evaluateXPathToString(
							'.',
							assertNode
						)}`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
			});
			break;
		}
		case 'assert-true':
		case 'assert-false': {
			addTests({
				[name]: () =>
					evaluateXPathToBoolean(xpath, contextNode, null, variablesInScope, {
						namespaceResolver,
						nodesFactory,
						language,
					}),
			});
			break;
		}
		case 'assert-eq': {
			const equalWith = evaluateXPathToString('.', assertNode);
			addTests({
				[name]: () =>
					evaluateXPathToBoolean(
						`${xpath} = ${equalWith}`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
			});
			break;
		}
		case 'assert-deep-eq': {
			const equalWith = evaluateXPathToString('.', assertNode);
			addTests({
				[name]: () =>
					evaluateXPathToBoolean(
						`deep-equal((${xpath}), (${equalWith}))`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
			});
			break;
		}
		case 'assert-empty': {
			addTests({
				[name]: () =>
					evaluateXPathToBoolean(
						`(${xpath}) => empty()`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
			});
			break;
		}
		case 'assert-count': {
			addTests({
				[name]: () =>
					evaluateXPathToNumber(
						`(${xpath}) => count()`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
			});
			break;
		}
		case 'assert-type': {
			const expectedType = evaluateXPathToString('.', assertNode);
			addTests({
				[name]: () =>
					evaluateXPathToBoolean(
						`(${xpath}) instance of ${expectedType}`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
			});
			break;
		}
		case 'assert-xml': {
			addTests({
				[name]: () =>
					evaluateXPathToNodes(xpath, contextNode, null, variablesInScope, {
						namespaceResolver,
						nodesFactory,
						language,
					}),
			});
			break;
		}
		case 'assert-string-value': {
			addTests({
				[name]: () =>
					evaluateXPathToString(`${xpath}`, contextNode, null, variablesInScope, {
						namespaceResolver,
						nodesFactory,
						language,
					}),
			});
			break;
		}
		case 'error':
		default:
			// Do not add test
			return;
	}
}

const runBenchmarking = () => {
	// tslint:disable-next-line: no-console
	console.log('Retrieving all the test sets...');
	const allTestSets = getAllTestSets();

	// tslint:disable-next-line: no-console
	console.log('Retrieving the names of runnable performance tests...');
	const performanceTests = getPerformanceTests();

	allTestSets.forEach((testSetFileName) => {
		const testSet = getFile(testSetFileName) as Document;

		// Find all the tests we can run
		const testCases: Element[] = evaluateXPathToNodes(ALL_TESTS_QUERY, testSet);
		if (!testCases.length) {
			return;
		}

		for (const testCase of testCases) {
			try {
				const testName = evaluateXPathToString('./@name', testCase);

				if (performanceTests.indexOf(testName) === -1) {
					continue;
				}

				const { contextNode, testQuery, language, namespaceResolver, variablesInScope } =
					getArguments(testSetFileName, testCase);
				const assertNode: Element = evaluateXPathToFirstNode('./result/*', testCase);

				addTestCaseToBenchmark(
					assertNode,
					language,
					testQuery,
					contextNode,
					variablesInScope,
					namespaceResolver,
					testName
				);
			} catch (e) {
				// tslint:disable-next-line: no-console
				console.error(e);
				continue;
			}
		}
	});

	runTests();
};

runBenchmarking();
