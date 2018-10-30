import {
	evaluateXPathToBoolean,
	evaluateXPathToMap,
	evaluateXPathToString
} from 'fontoxpath';

import { parse } from 'fontoxpath/parsing/xPathParser';

import fs from 'fs';

import path from 'path';
import chai from 'chai';

import { sync, slimdom } from 'slimdom-sax-parser';

if (!fs.promises) {
	fs.promises = {
		readFile: fs.readFileSync
	};
}

/**
 * Transform the given JsonML fragment into the corresponding DOM structure, using the given document to
 * create nodes.
 *
 * JsonML is always expected to be a JavaScript structure. If you have a string of JSON, use JSON.parse first.
 *
 * @param   {Document}  document  The document to use to create nodes
 * @param   {JsonML}    jsonml    The JsonML fragment to parse
 *
 * @return  {Node}      The root node of the constructed DOM fragment
 */
function parseNode (document, jsonml) {
	if (typeof jsonml === 'string' || typeof jsonml === 'number') {
		return document.createTextNode(jsonml);
	}

	if (!Array.isArray(jsonml)) {
		throw new TypeError('JsonML element should be an array or string');
	}

	var name = jsonml[0];

	// Node must be a normal element
	if (!(typeof name === 'string')) {
		console.error(name + ' is not a string. In: "' + JSON.stringify(jsonml) + '"');
	}
	var element = document.createElementNS('http://www.w3.org/2005/XQueryX', 'xqx:' + name),
		firstChild = jsonml[1],
		firstChildIndex = 1;
	if ((typeof firstChild === 'object') && !Array.isArray(firstChild)) {
		for (var attributeName in firstChild) {
			if (firstChild[attributeName] !== null) {
				element.setAttributeNS('http://www.w3.org/2005/XQueryX', 'xqx:' + attributeName, firstChild[attributeName]);
			}
		}
		firstChildIndex = 2;
	}
	// Parse children
	for (var i = firstChildIndex, l = jsonml.length; i < l; ++i) {
		var node = parseNode(document, jsonml[i]);
		element.appendChild(node);
	}

	return element;
}

function run () {
	const failingTestCSVPath = path.join('test', 'failingXQueryXTestNames.csv');
	const skippableTests = fs.readFileSync(failingTestCSVPath, 'utf-8')
		.split(/[\r\n]/);
	const skippableTestNames = skippableTests.map(result => result.split(',')[0]);

	const baseDir = path.join('test', 'assets', 'QT3TS-master');

	function normalizeEndOfLines (xpathString) {
		// Replace all character sequences of 0xD followed by 0xA and all 0xD not followed by 0xA with 0xA.
		return xpathString.replace(/(\x0D\x0A)|(\x0D(?!\x0A))/g, String.fromCharCode(0xA));
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
					xQueries[key] = fs.promises.readFile(xQueryPath, 'utf-8');
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
						it(testCase, async function () {
							const xQuery = await tryGetXQuery(directory, testName, testCase);

							if (!xQuery) {
								skippableTests.push(`${testCase},XQuery script could not be found`);
								throw new Error('XQuery script could not be found!');
							}

							let jsonMl;
							try {
								jsonMl = parse(xQuery);
							}
							catch (err) {
								if (err.location) {
									const start = err.location.start.offset;
									skippableTests.push(`${testCase},Parse error`);
									chai.assert.fail('Parse error', 'No parse error', xQuery.substring(0, start) + '[HERE]' + xQuery.substring(start));
								}
								else {
									skippableTests.push(`${testCase},Parser related error`);
									throw err;
								}
								this.skip();
							}

							const rawFile = (await fs.promises.readFile(testCasePath, 'utf-8')).replace(/\n\s*</g, '<');
							const actual = new slimdom.Document();
							try {
								actual.appendChild(parseNode(actual, jsonMl));
							} catch (e) {
								skippableTests.push(`${testCase},Parser resulted in invalid JsonML`);
								throw e;
							}
							actual.normalize();
							actual.documentElement.setAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'xsi:schemaLocation', `http://www.w3.org/2005/XQueryX
                                http://www.w3.org/2005/XQueryX/xqueryx.xsd`);

							let expected;
							try {
								expected = sync(rawFile);
							} catch (e) {
								skippableTests.push(`${testCase},Expected XML could not be parsed`);
								throw e;
							}

							// Compare contents as a quick fail. Use
							// contents because we can assume that
							// the outer element is the same, but it may contain random attributes we should ignore.

							const actualInnerHtml = new slimdom.XMLSerializer().serializeToString(actual.documentElement.firstElementChild);
							const expectedInnerHtml = new slimdom.XMLSerializer().serializeToString(expected.documentElement.firstElementChild);
							if (actualInnerHtml.replace(/></g, '>\n<') === expectedInnerHtml.replace(/></g, '>\n<')) {
								return;
							}

							if (!evaluateXPathToBoolean('deep-equal($expected, $actual)', null, null, { expected, actual })) {
								try {
									chai.assert.equal(
										new slimdom.XMLSerializer().serializeToString(actual.documentElement).replace(/></g, '>\n<'),
										new slimdom.XMLSerializer().serializeToString(expected.documentElement).replace(/></g, '>\n<'),
										'Expected the XML to be deep-equal');

								} catch (e) {
									skippableTests.push(`${testCase},result was not equal`);

									throw e;
								}
							}
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
