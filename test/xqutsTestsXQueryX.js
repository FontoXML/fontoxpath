import path from 'path';
import { buildTestCase } from './xQueryXUtils';
import testFs from 'test-helpers/testFs';

function run () {
	const skippableTests = process.argv.indexOf('--regenerate') === -1 ?
		testFs.readFileSync('failingXQUTSXQueryXTestNames.csv').split(/\r?\n/) : [];
	const skippableTestNames = skippableTests.map(result => result.split(',')[0]);

	const baseDir = path.join('XQUTS', 'Queries');

	function normalizeEndOfLines (xpathString) {
		// Replace all character sequences of 0xD followed by 0xA and all 0xD not followed by 0xA with 0xA.
		return xpathString.replace(/(\x0D+\x0A)|(\x0D+(?!\x0A))/g, String.fromCharCode(0xA));
	}

	function buildTestCases (testPath) {
		const xQueryXPath = path.join(baseDir, 'XQueryX', ...testPath);

		testFs.readdirSync(xQueryXPath).forEach(candidate => {
			const candidatePath = path.join(xQueryXPath, candidate);
			if (testFs.lstatSync(candidatePath).isDirectory()) {
				testPath.push(candidate);
				describe(candidate, function () {
					buildTestCases(testPath);
				});
				testPath.pop();
			} else {
				const testCase = candidate.substring(0, candidate.length - 4);

				if (skippableTestNames.includes(testCase)) {
					it.skip(testCase);
					return;
				}

				const xQueryPath = path.join(baseDir, 'XQuery', ...testPath, testCase + '.xq');
				const xQueryXPath = path.join(baseDir, 'XQueryX', ...testPath, candidate);

				const loadXQuery = async () => {
					if (!testFs.existsSync(xQueryPath)) {
						return null;
					}
					return await testFs.readFile(xQueryPath);
				};
				const loadXQueryX = async () => normalizeEndOfLines(await testFs.readFile(xQueryXPath));

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
		testFs.writeFileSync('failingXQUTSXQueryXTestNames.csv', skippableTests.join('\n').trim() + '\n');
	});
}

describe('XQUTS XQueryX tests', () => {
	run();
});
