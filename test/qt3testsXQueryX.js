const { evaluateXPathToBoolean, evaluateXPathToString } = require('../dist/fontoxpath');
const parser = require('../src/parsing/xPathParser.new');
const jsonMlMapper = require('./helpers/jsonMlMapper');
const fs = require('fs');
const mocha = require('mocha');
const path = require('path');
const { sync, slimdom } = require('slimdom-sax-parser');

const baseDir = path.join('test', 'assets', 'QT3TS-master');

let shouldRunTestByName;

const indexOfGrep = process.argv.indexOf('--grep');
if (indexOfGrep >= 0) {
	const [greppedTestsetName] = process.argv[indexOfGrep + 1].split('~');
	shouldRunTestByName = { [greppedTestsetName.replace(/\\./g, '.')]: true };
}

function tryGetXQuery (test) {
	let xQueryPath = path.join(baseDir, test.directory, test.testName);

	if (fs.existsSync(xQueryPath)) {
		// Should be a folder containing a '.xq' file
		if (!fs.lstatSync(xQueryPath).isDirectory()) {
			throw new Error('This is not expected.');
		}
		xQueryPath = path.join(xQueryPath, test.testCase) + '.xq';
		if (!fs.existsSync(xQueryPath)) {
			return null;
		}

		return fs.readFileSync(xQueryPath, 'utf-8');
	}

	xQueryPath = xQueryPath + '.xml';
	if (!fs.existsSync(xQueryPath)) {
		throw new Error('No xQuery test file found.');
	}

	const xml = sync(fs.readFileSync(xQueryPath, 'utf-8'));
	return evaluateXPathToString('//test-case[@name=$testCase]/test', xml, null, { testCase: test.testCase });
}

fs.readdirSync(path.join(baseDir, 'xqueryx')).forEach(directory => {
	const directoryPath = path.join(baseDir, 'xqueryx', directory);

	if (!fs.lstatSync(directoryPath).isDirectory()) {
		return;
	}

	fs.readdirSync(directoryPath).forEach(subDirectory => {
		const subDirectoryPath = path.join(directoryPath, subDirectory);
		if (!fs.lstatSync(subDirectoryPath).isDirectory()) {
			throw new Error('Only sub directories are expected.');
		}

		// Sub directories are the test name prefixed with "{parent directory}-"
		const testName = subDirectory.substring(directory.length + 1);
		describe(testName, () => {

			fs.readdirSync(subDirectoryPath).forEach(testCase => {
				const testCasePath = path.join(subDirectoryPath, testCase);
				if (fs.lstatSync(testCasePath).isDirectory()) {
					throw new Error('Test cases should be files.');
				}

				// Test case is the file name without extension
				testCase = testCase.substring(0, testCase.length - 4);

				it(testCase, function () {
					const xQuery = tryGetXQuery({ directory, testName, testCase });

					if (!xQuery) {
						this.skip();
						return;
					}

					try {
						const parsed = parser.parse(xQuery);
						const expected = sync(fs.readFileSync(testCasePath, 'utf-8'));
						const actual = jsonMlMapper.parse(parsed, new slimdom.Document());

						chai.assert(evaluateXPathToBoolean('deep-equal($expected, $actual)', null, null, { expected, actual }), 'expected: "${expected}" actual: "${actual}"');
					}
					catch (err) {
						console.log(testCasePath);
						console.log(err);
						if (err.location) {
							const start = err.location.start.offset;
							console.log(xQuery.substring(0, start) + '[HERE]' + xQuery.substring(start));
						}
						throw err;
					}
				});
			});
		});
	});
});
