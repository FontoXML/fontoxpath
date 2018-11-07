import {
	evaluateXPathToMap
} from 'fontoxpath';
import fs from 'fs';
import path from 'path';
import { sync } from 'slimdom-sax-parser';
import { buildTestCase } from './xQueryXUtils';

if (!fs.promises) {
	fs.promises = {
		readFile: fs.readFileSync
	};
}

function run () {
	const failingTestCSVPath = path.join('test', 'failingXQueryXTestNames.csv');
	const skippableTests = fs.readFileSync(failingTestCSVPath, 'utf-8')
		.split(/\r?\n/);
	const skippableTestNames = skippableTests.map(result => result.split(',')[0]);

	const baseDir = path.join('test', 'assets', 'QT3TS-master');

	function normalizeEndOfLines (xpathString) {
		// Replace all character sequences of 0xD followed by 0xA and all 0xD not followed by 0xA with 0xA.
		return xpathString.replace(/(\x0D+\x0A)|(\x0D+(?!\x0A))/g, String.fromCharCode(0xA));
	}
	async function getXQueries (directory, testName) {
		const testDirectory = path.join(baseDir, directory);
		const testFilePath = path.join(testDirectory, testName) + '.xml';
		if (!fs.existsSync(testFilePath)) {
			return null;
		}

		const xml = sync(await fs.promises.readFile(testFilePath, 'utf-8'));
		const xQueries = evaluateXPathToMap('(/descendant::test-case/map:entry(@name, (test/@file/string(), test/string())[1])) => map:merge()', xml);

		Object.keys(xQueries).forEach(key => {
			const value = xQueries[key];

			if (value.substring(value.length - 3) === '.xq') {
				const xQueryPath = path.join(testDirectory, value);
				if (fs.existsSync(xQueryPath)) {
					xQueries[key] = normalizeEndOfLines(fs.promises.readFile(xQueryPath, 'utf-8'));
				}
				else {
					xQueries[key] = null;
				}
			}
			else {
				xQueries[key] = normalizeEndOfLines(value);
			}
		});

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

	fs.readdirSync(path.join(baseDir, 'xqueryx')).forEach(directory => {
		const directoryPath = path.join(baseDir, 'xqueryx', directory);

		if (!fs.lstatSync(directoryPath).isDirectory()) {
			return;
		}

		fs.readdirSync(directoryPath)
			.forEach(subDirectory => {
				const subDirectoryPath = path.join(directoryPath, subDirectory);
				if (!fs.lstatSync(subDirectoryPath).isDirectory()) {
					throw new Error('Only sub directories are expected.');
				}

				// Sub directories are the test name prefixed with "{parent directory}-"
				const testName = subDirectory.substring(directory.length + 1);
				describe(directory + '/' + testName, function () {
					// Tests are slow in CI
					this.timeout(60000);
					fs.readdirSync(subDirectoryPath).forEach(testCase => {
						const testCasePath = path.join(subDirectoryPath, testCase);
						if (fs.lstatSync(testCasePath).isDirectory()) {
							throw new Error('Test cases should be files.');
						}

						// Test case is the file name without extension
						testCase = testCase.substring(0, testCase.length - 4);

						if (skippableTestNames.includes(testCase)) {
							it.skip(testCase);
							return;
						}

						const loadXQuery = async () => await tryGetXQuery(directory, testName, testCase);
						const loadXQueryX = async () => await fs.promises.readFile(testCasePath, 'utf-8');

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
		fs.writeFileSync(failingTestCSVPath, skippableTests.join('\n').trim() + '\n');
	});
}

run();
