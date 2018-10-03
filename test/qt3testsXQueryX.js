const {
	evaluateXPathToBoolean,
	evaluateXPathToString
} = require('../dist/fontoxpath');

const parser = require('../src/parsing/xPathParser.new');

const jsonMlMapper = require('./helpers/jsonMlMapper');

const fs = require('fs');
const path = require('path');

const { sync, slimdom } = require('slimdom-sax-parser');





const baseDir = path.join('test', 'assets', 'QT3TS-master');

const testCases = getTestCases(path.join(baseDir, 'xqueryx'), []);
testCases.forEach(testCase => {
	console.log(testCase);
});

function getTestCases (basePath, parts) {
	const cases = [];

	fs.readdirSync(basePath).forEach(entry => {
		parts.push(entry);

		const entryPath = path.join(basePath, entry);
		if (fs.lstatSync(entryPath).isDirectory()) {

			cases.push(getTestCases(entryPath, parts));

		}
		else {
			var xQuery = tryGetXQuery(parts);

			let parsed;
			try {
				parsed = parser.parse(xQuery);
			}
			catch (err) {
				console.log(err);
				const start = err.location.start.offset;
				console.log(xQuery.substring(0, start) + '[HERE]' + xQuery.substring(start));
			}

			const expected = sync(fs.readFileSync(entryPath, 'utf-8'));
			const actual = jsonMlMapper.parse(parsed, new slimdom.Document());
			const isOk = evaluateXPathToBoolean('deep-equal($expected, $actual)', null, null, { expected, actual });

			cases.push(bob);
		}
		parts.pop();
	});
	return cases;
}

function tryGetXQuery (parts) {
	const directory = parts[0];
	const test = parts[1].substring(parts[0].length + 1);
	const testCase = parts[2].substring(0, parts[2].length - 4);

	let xQueryPath = path.join(baseDir, directory, test);

	if (fs.existsSync(xQueryPath)) {
		// Should be a folder containing a '.xq' file
		if (!fs.lstatSync(xQueryPath).isDirectory()) {
			throw new Error('This is not expected.');
		}
		xQueryPath = path.join(xQueryPath, testCase) + '.xq';
		if (!fs.existsSync(xQueryPath)) {
			throw new Error('No xQuery test file found.');
		}

		return fs.readFileSync(xQueryPath, 'utf-8');
	}

	xQueryPath = xQueryPath + '.xml';
	if (!fs.existsSync(xQueryPath)) {
		throw new Error('No xQuery test file found.');
	}

	const xml = sync(fs.readFileSync(xQueryPath, 'utf-8'));
	return evaluateXPathToString('//test-case[@name=$testCase]/test', xml, null, { testCase });
}
