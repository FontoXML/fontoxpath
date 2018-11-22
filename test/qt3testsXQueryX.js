import {
	evaluateXPathToMap
} from 'fontoxpath';
import path from 'path';
import { sync } from 'slimdom-sax-parser';
import { buildTestCase } from './xQueryXUtils';
import { getSkippedTests } from 'test-helpers/getSkippedTests';
import testFs from 'test-helpers/testFs';

function run () {
	const skippableTests = getSkippedTests('failingXQueryXTestNames.csv');
	const skippableTestNames = skippableTests.map(result => result.split(',')[0]);

	const baseDir = 'QT3TS';

	function normalizeEndOfLines (xpathString) {
		// Replace all character sequences of 0xD followed by 0xA and all 0xD not followed by 0xA with 0xA.
		return xpathString.replace(/(\x0D+\x0A)|(\x0D+(?!\x0A))/g, String.fromCharCode(0xA));
	}
	async function getXQueries (directory, testName) {
		const testDirectory = path.join(baseDir, directory);
		const testFilePath = path.join(testDirectory, testName) + '.xml';
		if (!testFs.existsSync(testFilePath)) {
			return null;
		}

		const xml = sync(await testFs.readFile(testFilePath));
		const xQueries = evaluateXPathToMap('(/descendant::test-case/map:entry(@name, (test/@file/string(), test/string())[1])) => map:merge()', xml);

		for (const key of Object.keys(xQueries)) {
			const value = xQueries[key];

			if (value.substring(value.length - 3) === '.xq') {
				const xQueryPath = path.join(testDirectory, value);
				if (testFs.existsSync(xQueryPath)) {
					xQueries[key] = normalizeEndOfLines(await testFs.readFile(xQueryPath));
				} else {
					xQueries[key] = null;
				}
			} else {
				xQueries[key] = normalizeEndOfLines(value);
			}
		}

		return xQueries;
	}

	const xQueries = [];
	async function tryGetXQuery (directory, testName, testCase) {
		let queries = xQueries[testName];
		if (!queries) {
			queries = await getXQueries(directory, testName);
			xQueries[testName] = queries;
		}

		return queries && queries[testCase];
	}

	testFs.readdirSync(path.join(baseDir, 'xqueryx')).forEach(directory => {
		const directoryPath = path.join(baseDir, 'xqueryx', directory);

		if (!testFs.lstatSync(directoryPath).isDirectory()) {
			return;
		}

		testFs.readdirSync(directoryPath)
			.forEach(subDirectory => {
				const subDirectoryPath = path.join(directoryPath, subDirectory);
				if (!testFs.lstatSync(subDirectoryPath).isDirectory()) {
					throw new Error('Only sub directories are expected.');
				}

				// Sub directories are the test name prefixed with "{parent directory}-"
				const testName = subDirectory.substring(directory.length + 1);
				describe(directory + '/' + testName, function () {
					// Tests are slow in CI
					this.timeout(60000);
					testFs.readdirSync(subDirectoryPath).forEach(testCase => {
						const testCasePath = path.join(subDirectoryPath, testCase);
						if (testFs.lstatSync(testCasePath).isDirectory()) {
							throw new Error('Test cases should be files.');
						}

						// Test case is the file name without extension
						testCase = testCase.substring(0, testCase.length - 4);

						if (skippableTestNames.includes(testCase)) {
							it.skip(testCase);
							return;
						}

						const loadXQuery = async () => await tryGetXQuery(directory, testName, testCase);
						const loadXQueryX = async () => await testFs.readFile(testCasePath);

						buildTestCase(testCase, loadXQuery, loadXQueryX, skippableTests, actual => {
							actual.documentElement.setAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'xsi:schemaLocation', `http://www.w3.org/2005/XQueryX
                                http://www.w3.org/2005/XQueryX/xqueryx.xsd`);
						});
					});
				});
			});
	});

	after(() => {
		console.log(`Marking ${skippableTests.length} tests as known to fail`);
		testFs.writeFileSync('failingXQueryXTestNames.csv', skippableTests.join('\n').trim() + '\n');
	});
}

run();
