import {
	evaluateXPathToBoolean,
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

function run () {
	const skippableTestNames = fs.readFileSync(path.join('test', 'unrunnableXQueryXTestNames.csv'), 'utf-8')
		.split(/[\r\n]/)
		.map(line => line.split(/,/g)[0]);

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

	const baseDir = path.join('test', 'assets', 'QT3TS-master');

	function normalizeEndOfLines (xpathString) {
		// Replace all character sequences of 0xD followed by 0xA and all 0xD not followed by 0xA with 0xA.
		return xpathString.replace(/(\x0D\x0A)|(\x0D(?!\x0A))/g, String.fromCharCode(0xA));
	}

	async function tryGetXQuery (test) {
		const testDirectory = path.join(baseDir, test.directory);
		const testFilePath = path.join(testDirectory, test.testName) + '.xml';

		if (!fs.existsSync(testFilePath)) {
			return null;
		}


		const xml = sync(await fs.promises.readFile(testFilePath, 'utf-8'));

		const xQueryRelativePath = evaluateXPathToString('/descendant::test-case[@name=$testCase]/head(.)/test/@file', xml, null, { testCase: test.testCase });
		if (xQueryRelativePath) {
			const xQueryPath = path.join(testDirectory, xQueryRelativePath);
			if (fs.existsSync(xQueryPath)) {
				return fs.promises.readFile(xQueryPath, 'utf-8');
			}
			return null;
		}

		return normalizeEndOfLines(evaluateXPathToString('/descendant::test-case[@name=$testCase]/head(.)/test', xml, null, { testCase: test.testCase }));
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
				describe(directory + '/' + testName, () => {
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
							const xQuery = await tryGetXQuery({ directory, testName, testCase });

							if (!xQuery) {
								throw new Error('XQuery script could not be found!');
							}

							let jsonMl;
							try {
								jsonMl = parse(xQuery);
							}
							catch (err) {
								if (err.location) {
									const start = err.location.start.offset;
									chai.assert.fail('Parse error', 'No parse error', xQuery.substring(0, start) + '[HERE]' + xQuery.substring(start));
								}
								else {
									throw err;
								}
								this.skip();
							}

							const rawFile = (await fs.promises.readFile(testCasePath, 'utf-8')).replace(/\n\s*</g, '<');
							const actual = new slimdom.Document();
							actual.appendChild(parseNode(actual, jsonMl));
							actual.normalize();
							actual.documentElement.setAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'xsi:schemaLocation', `http://www.w3.org/2005/XQueryX
                                http://www.w3.org/2005/XQueryX/xqueryx.xsd`);

							const expected = sync(rawFile);

							if (actual.documentElement.innerHTML.replace(/></g, '>\n<') === expected.documentElement.innerHTML.replace(/></g, '>\n<')) {
								return;
							}

							if (!evaluateXPathToBoolean('deep-equal($expected, $actual)', null, null, { expected, actual })) {
								chai.assert.equal(
									actual.documentElement.outerHTML.replace(/></g, '>\n<'),
									expected.documentElement.outerHTML.replace(/></g, '>\n<'),
									'Expected the XML to be deep-equal');
							}
						});
					});
				});
			});
	});
}

run();
