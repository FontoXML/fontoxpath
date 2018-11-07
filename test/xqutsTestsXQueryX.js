import fs from 'fs';
import path from 'path';
import { buildTestCase } from './xQueryXUtils';

if (!fs.promises) {
	fs.promises = {
		readFile: fs.readFileSync
	};
}

function run () {
	const failingTestCSVPath = path.join('test', 'failingXQUTSXQueryXTestNames.csv');
	const skippableTests = fs.readFileSync(failingTestCSVPath, 'utf-8')
		.split(/[\r\n]/);
	const skippableTestNames = skippableTests.map(result => result.split(',')[0]);

	const baseDir = path.join('test', 'assets', 'XQUTS_current', 'Queries');

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

				const loadXQuery = async () => {
					if (!fs.existsSync(xQueryPath)) {
						return null;
					}
					return await fs.promises.readFile(xQueryPath, 'utf-8');
				};
				const loadXQueryX = async () => await fs.promises.readFile(xQueryXPath, 'utf-8');

				buildTestCase(testCase, loadXQuery, loadXQueryX, skippableTests, actual => {
					actual.documentElement.setAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'xsi:schemaLocation', `http://www.w3.org/2007/xquery-update-10
                                http://www.w3.org/2007/xquery-update-10/xquery-update-10-xqueryx.xsd`);
				});
			}
		});
	}

	buildTestCases([]);

	after(() => {
		console.log(`Marking ${skippableTests.length} tests as known to fail`);
		fs.writeFileSync(failingTestCSVPath, skippableTests.join('\n').trim() + '\n');
	});
}

run();
