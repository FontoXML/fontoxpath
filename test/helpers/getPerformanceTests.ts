import { evaluateXPathToFirstNode, evaluateXPathToNodes, evaluateXPathToString } from 'fontoxpath';

import {
	ALL_TESTS_QUERY,
	getAllTestSets,
	getFile,
	unrunnableTestCasesByName,
} from './qt3TestsTools';
import testFs from './testFs';

const PERFORMANCE_TESTS_FILE = 'runnablePerformanceTestNames.csv';
const DEFAULT_NUMBER_OF_TEST = 50;

const createNewRunnableTests = (numberOfTest) => {
	const allTestSets = getAllTestSets();
	const allTestNames = [];
	const newRunnableTests = new Set();

	for (const testSetFileName of allTestSets) {
		const testSet = getFile(testSetFileName);

		// Find all the tests we can run
		const testCases = evaluateXPathToNodes(ALL_TESTS_QUERY, testSet);

		for (const testCase of testCases) {
			try {
				const testName = evaluateXPathToString('./@name', testCase);

				if (unrunnableTestCasesByName[testName]) {
					continue;
				}

				const assertionNode = evaluateXPathToFirstNode('./result/*', testCase);
				const assertionType = assertionNode && (assertionNode as any).localName;

				switch (assertionType) {
					case 'assert':
					case 'assert-true':
					case 'assert-eq':
					case 'assert-deep-eq':
					case 'assert-empty':
					case 'assert-false':
					case 'assert-count':
					case 'assert-type':
					case 'assert-xml':
					case 'assert-string-value':
					case 'all-of':
					case 'any-of':
						allTestNames.push(testName);
				}
			} catch (e) {
				// tslint:disable-next-line: no-console
				console.error(e);
				continue;
			}
		}
	}

	while (newRunnableTests.size < numberOfTest) {
		const randomTestName = allTestNames[Math.floor(Math.random() * allTestNames.length)];
		newRunnableTests.add(randomTestName);
	}

	testFs.writeFileSync(PERFORMANCE_TESTS_FILE, [...Array.from(newRunnableTests)].join('\n'));
};

export default function getPerformanceTests() {
	const regenerateIndex = process.argv.indexOf('--regenerate');
	if (regenerateIndex !== -1) {
		const nextArg = process.argv[regenerateIndex + 1];
		const numberOfTest = nextArg === undefined ? DEFAULT_NUMBER_OF_TEST : parseInt(nextArg, 10);

		if (isNaN(numberOfTest) || numberOfTest < 1) {
			throw new Error('The parameter for the number of tests must be a positive number.');
		}

		createNewRunnableTests(numberOfTest);
	}

	return testFs.readFileSync(PERFORMANCE_TESTS_FILE).split(/\r?\n/);
}
