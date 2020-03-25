import * as chai from 'chai';
import {
	evaluateXPath,
	evaluateXPathToArray,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
	registerXQueryModule,
} from 'fontoxpath';

import { getSkippedTests } from 'test-helpers/getSkippedTests';
import testFs from 'test-helpers/testFs';

import * as mocha from 'mocha';
import { sync, slimdom } from 'slimdom-sax-parser';

(global as any).atob = function (b64Encoded) {
	return new Buffer(b64Encoded, 'base64').toString('binary');
};

(global as any).btoa = function (str) {
	return new Buffer(str, 'binary').toString('base64');
};

const parser = {
	parseFromString: (xmlString) => {
		try {
			return sync(xmlString);
		} catch (e) {
			console.log(`Error parsing the string ${xmlString}.`, e);
			throw e;
		}
	},
};

let shouldRunTestByName;

const indexOfGrep = process.argv.indexOf('--grep');
if (indexOfGrep >= 0) {
	const [greppedTestsetName] = process.argv[indexOfGrep + 1].split('~');
	shouldRunTestByName = { [greppedTestsetName.replace(/\\./g, '.')]: true };
} else {
	shouldRunTestByName = testFs
		.readFileSync('runnableTestSets.csv')
		.split(/\r?\n/)
		.map((line) => line.split(','))
		.reduce(
			(accum, [name, run]) => Object.assign(accum, { [name]: run === 'true' }),
			Object.create(null)
		);
}
const unrunnableTestCases = getSkippedTests('unrunnableTestCases.csv');
const unrunnableTestCasesByName = unrunnableTestCases
	.map((line) => line.split(','))
	.reduce(
		(accum, [name, ...runInfo]) => Object.assign(accum, { [name]: runInfo.join(',') }),
		Object.create(null)
	);

const globalDocument = parser.parseFromString('<xml/>');
const instantiatedDocumentByAbsolutePath = Object.create(null);

function getFile(fileName) {
	while (fileName.includes('..')) {
		const parts = fileName.split('/');
		fileName = parts
			.slice(0, parts.indexOf('..') - 1)
			.concat(parts.slice(parts.indexOf('..') + 1))
			.join('/');
	}
	if (instantiatedDocumentByAbsolutePath[fileName]) {
		return instantiatedDocumentByAbsolutePath[fileName];
	}

	let content = testFs.readFileSync(`QT3TS/${fileName}`).replace(/\r\n/g, '\n');
	if (fileName.endsWith('.out')) {
		if (content.endsWith('\n')) {
			content = content.slice(0, -1);
		}
		content = `<xml>${content}</xml>`;
		const parsedContents = Array.from(parser.parseFromString(content).firstChild.childNodes);
		const documentFragment = globalDocument.createDocumentFragment(null, null);
		parsedContents.forEach((node) => documentFragment.appendChild(node));
		return (instantiatedDocumentByAbsolutePath[fileName] = documentFragment);
	}
	if (fileName.includes('.xq')) {
		return content;
	}
	return (instantiatedDocumentByAbsolutePath[fileName] = parser.parseFromString(content));
}

function createAsserter(baseUrl, assertNode, language) {
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
		case 'all-of': {
			const asserts = evaluateXPathToNodes('*', assertNode).map((innerAssertNode) =>
				createAsserter(baseUrl, innerAssertNode, language)
			);
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				asserts.forEach((a) => a(xpath, contextNode, variablesInScope, namespaceResolver));
		}
		case 'any-of': {
			const asserts = evaluateXPathToNodes('*', assertNode).map((innerAssertNode) =>
				createAsserter(baseUrl, innerAssertNode, language)
			);
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				const errors = [];
				chai.assert(
					asserts.some((a) => {
						try {
							a(xpath, contextNode, variablesInScope, namespaceResolver);
						} catch (error) {
							if (error instanceof TypeError) {
								// TypeErrors are always errors
								throw error;
							}
							errors.push(error);
							return false;
						}
						return true;
					}),
					`Expected executing the XPath "${xpath}" to resolve to one of the expected results, but got ${errors.join(
						', '
					)}.`
				);
			};
		}
		case 'error': {
			const errorCode = evaluateXPathToString('@code', assertNode);
			return (
				xpath: string,
				contextNode: slimdom.Element,
				variablesInScope: object,
				namespaceResolver: (str: string) => string
			) =>
				chai.assert.throws(
					() => {
						evaluateXPathToString(xpath, contextNode, null, variablesInScope, {
							namespaceResolver,
							nodesFactory,
							language,
						});
					},
					errorCode === '*' ? /.*/ : new RegExp(errorCode),
					xpath
				);
		}
		case 'assert':
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.isTrue(
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
					xpath
				);
		case 'assert-true':
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.isTrue(
					evaluateXPathToBoolean(xpath, contextNode, null, variablesInScope, {
						namespaceResolver,
						nodesFactory,
						language,
					}),
					`Expected XPath ${xpath} to resolve to true`
				);
		case 'assert-eq': {
			const equalWith = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.isTrue(
					evaluateXPathToBoolean(
						`${xpath} = ${equalWith}`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
					`Expected XPath ${xpath} to resolve to ${equalWith}`
				);
		}
		case 'assert-deep-eq': {
			const equalWith = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.isTrue(
					evaluateXPathToBoolean(
						`deep-equal((${xpath}), (${equalWith}))`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
					`Expected XPath ${xpath} to (deep equally) resolve to ${equalWith}`
				);
		}
		case 'assert-empty':
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.isTrue(
					evaluateXPathToBoolean(
						`(${xpath}) => empty()`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
					`Expected XPath ${xpath} to resolve to the empty sequence`
				);
		case 'assert-false':
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.isFalse(
					evaluateXPathToBoolean(xpath, contextNode, null, variablesInScope, {
						namespaceResolver,
						nodesFactory,
						language,
					}),
					`Expected XPath ${xpath} to resolve to false`
				);
		case 'assert-count': {
			const expectedCount = evaluateXPathToNumber('number(.)', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.equal(
					evaluateXPathToNumber(
						`(${xpath}) => count()`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
					expectedCount,
					`Expected ${xpath} to resolve to ${expectedCount}`
				);
		}
		case 'assert-type': {
			const expectedType = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.isTrue(
					evaluateXPathToBoolean(
						`(${xpath}) instance of ${expectedType}`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
					`Expected XPath ${xpath} to resolve to something of type ${expectedType}`
				);
		}
		case 'assert-xml': {
			let parsedFragment;
			if (evaluateXPathToBoolean('@file', assertNode)) {
				parsedFragment = getFile(
					evaluateXPathToString('$baseUrl || "/" || @file', assertNode, null, { baseUrl })
				);
			} else {
				parsedFragment = parser.parseFromString(
					`<xml>${evaluateXPathToString('.', assertNode)}</xml>`
				).documentElement;
			}
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				const result = evaluateXPathToNodes(xpath, contextNode, null, variablesInScope, {
					namespaceResolver,
					nodesFactory,
					language,
				});
				chai.assert(
					evaluateXPathToBoolean('deep-equal($a, $b)', null, null, {
						a: result,
						b: Array.from(parsedFragment.childNodes),
					}),
					`Expected XPath ${xpath} to resolve to the given XML. Expected ${result
						.map((result) => new slimdom.XMLSerializer().serializeToString(result))
						.join(' ')} to equal ${
						parsedFragment.nodeType === parsedFragment.DOCUMENT_FRAGMENT_NODE
							? parsedFragment.childNodes
									.map((n) => new slimdom.XMLSerializer().serializeToString(n))
									.join(' ')
							: parsedFragment.innerHTML
					}`
				);
			};
		}
		case 'assert-string-value': {
			const expectedString = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.equal(
					evaluateXPathToString(`${xpath}`, contextNode, null, variablesInScope, {
						namespaceResolver,
						nodesFactory,
						language,
					}),
					expectedString,
					xpath
				);
		}
		default:
			return () => {
				chai.assert.fail(null, null, `Skipped test, it was a ${assertNode.localName}`);
			};
	}
}
function getAsserterForTest(baseUrl, testCase, language) {
	return createAsserter(baseUrl, evaluateXPathToFirstNode('./result/*', testCase), language);
}

const catalog = getFile('catalog.xml');
const emptyDoc = catalog.implementation.createDocument(null, null);

function createEnvironment(cwd, environmentNode) {
	const fileName = evaluateXPathToString('source[@role="."]/@file', environmentNode);
	const variables = evaluateXPathToNodes('source[@role!="."]', environmentNode).reduce(
		(varsByName, variable) =>
			Object.assign(varsByName, {
				[evaluateXPathToString('@role', variable).substr(1)]: getFile(
					(cwd ? cwd + '/' : '') + evaluateXPathToString('@file', variable)
				),
			}),
		{}
	);

	// Params area also variables. But different
	evaluateXPathToNodes('param', environmentNode).forEach((paramNode) => {
		variables[evaluateXPathToString('@name', paramNode)] = evaluateXPath(
			evaluateXPathToString('@select', paramNode)
		);
		console.log(variables);
	});

	const namespaces = evaluateXPathToMap(
		'(namespace!map:entry(@prefix/string(), @uri/string())) => map:merge()',
		environmentNode
	);

	return {
		contextNode: fileName ? getFile((cwd ? cwd + '/' : '') + fileName) : null,
		namespaceResolver: Object.keys(namespaces).length ? (prefix) => namespaces[prefix] : null,
		variables,
	};
}

const environmentsByName = evaluateXPathToNodes('/catalog/environment', catalog).reduce(
	(envByName, environmentNode) => {
		return Object.assign(envByName, {
			[evaluateXPathToString('@name', environmentNode)]: createEnvironment(
				'',
				environmentNode
			),
		});
	},
	{
		empty: {
			contextNode: emptyDoc,
		},
	}
);

const registeredModuleURIByFileName = Object.create(null);

describe('qt3 test set', () => {
	const log = unrunnableTestCases;
	evaluateXPathToNodes('/catalog/test-set', catalog)
		.filter((testSetNode) => shouldRunTestByName[evaluateXPathToString('@name', testSetNode)])
		.map((testSetNode) => evaluateXPathToString('@file', testSetNode))
		.forEach((testSetFileName) => {
			const testSet = getFile(testSetFileName);

			const testSetName = evaluateXPathToString('/test-set/@name', testSet);

			// Find all the tests we can run
			const testCases = evaluateXPathToNodes(
				`
/test-set/test-case[
  let $dependencies := (./dependency | ../dependency)
  return not(exists($dependencies[@type="xml-version" and @value="1.1"])) and not(
     $dependencies/@value/tokenize(.) = (
       "XQ10",
       "XQ20",
       "XQ30",
       "schemaValidation",
       "schemaImport",
       (:"staticTyping",:)
       (:"serialization",:)
       "infoset-dtd",
       (:"xpath-1.0-compatibility",:)
       "namespace-axis",
       (:"moduleImport",:)
       "schema-location-hint",
       (:"collection-stability",:)
       "directory-as-collation-uri",
       (:"fn-transform-XSLT",:)
       (:"fn-transform-XSLT30",:)
       (:"fn-format-integer-CLDR",:)
       (:"non-empty-sequence-collection",:)
       "non-unicode-codepoint-collation",
       "simple-uca-fallback",
       "advanced-uca-fallback"))]`,
				testSet
			);
			if (!testCases.length) {
				return;
			}

			describe(
				evaluateXPathToString(
					'/test-set/@name || /test-set/description!(if (string()) then "~" || . else "")',
					testSet
				),
				function () {
					this.timeout(60000);
					for (const testCase of testCases) {
						try {
							const testName = evaluateXPathToString('./@name', testCase);
							const description =
								testSetName +
								'~' +
								testName +
								'~' +
								evaluateXPathToString(
									'if (description/text()) then description else test',
									testCase
								);

							if (unrunnableTestCasesByName[testName]) {
								it.skip(`${unrunnableTestCasesByName[testName]}. (${description})`);
								continue;
							}

							const assertFn = () => {
								const baseUrl = testSetFileName.substr(
									0,
									testSetFileName.lastIndexOf('/')
								);

								let testQuery;
								if (evaluateXPathToBoolean('./test/@file', testCase)) {
									testQuery = getFile(
										evaluateXPathToString(
											'$baseUrl || "/" || test/@file',
											testCase,
											null,
											{ baseUrl }
										)
									);
								} else {
									testQuery = evaluateXPathToString('./test', testCase);
								}
								const language = evaluateXPathToString(
									`if (((dependency)[@type = "spec"]/@value)!tokenize(.) = ("XQ10+", "XQ30+", "XQ31+", "XQ31"))
										then "XQuery3.1" else if (((dependency)[@type = "spec"]/@value)!tokenize(.) = ("XP20", "XP20+", "XP30", "XP30+"))
										then "XPath3.1"	else if (((../dependency)[@type = "spec"]/@value)!tokenize(.) = ("XQ10+", "XQ30+", "XQ31+", "XQ31"))
										then "XQuery3.1" else "XPath3.1"`,
									testCase
								);
								const namespaces = evaluateXPathToMap(
									'(environment/namespace!map:entry(@prefix/string(), @uri/string())) => map:merge()',
									testCase
								);

								const localNamespaceResolver = Object.keys(namespaces).length
									? (prefix) => namespaces[prefix]
									: null;
								let namespaceResolver = localNamespaceResolver;
								let variablesInScope;
								const environmentNode = evaluateXPathToFirstNode(
									'let $ref := ./environment/@ref return if ($ref) then /test-set/environment[@name = $ref] else ./environment',
									testCase,
									null
								);
								let env;
								if (environmentNode) {
									env = createEnvironment(baseUrl, environmentNode);
								} else {
									env =
										environmentsByName[
											evaluateXPathToString(
												'(./environment/@ref, "empty")[1]',
												testCase
											)
										];
								}

								const contextNode = env.contextNode;
								namespaceResolver = localNamespaceResolver
									? (prefix) =>
											localNamespaceResolver(prefix) ||
											env.namespaceResolver(prefix)
									: (prefix) =>
											env.namespaceResolver
												? env.namespaceResolver(prefix)
												: prefix === ''
												? null
												: undefined;
								variablesInScope = env.variables;
								try {
									const asserter = getAsserterForTest(
										baseUrl,
										testCase,
										language
									);

									// Load the module within the try to catch any errors from the module
									const moduleImports = evaluateXPathToArray(
										'array{module!map{"uri": @uri/string(), "file": $baseUrl || "/" || @file/string()}}',
										testCase,
										null,
										{
											baseUrl: baseUrl,
										}
									);
									moduleImports.forEach((moduleImport) => {
										const targetNamespace =
											registeredModuleURIByFileName[moduleImport.file] ||
											registerXQueryModule(getFile(moduleImport.file));

										registeredModuleURIByFileName[
											moduleImport.file
										] = targetNamespace;
									});

									asserter(
										testQuery,
										contextNode,
										variablesInScope,
										namespaceResolver
									);
								} catch (e) {
									if (e instanceof TypeError) {
										throw e;
									}

									log.push(
										`${testName},${e.toString().replace(/\n/g, ' ').trim()}`
									);

									// And rethrow the error
									throw e;
								}
							};
							assertFn.toString = () =>
								new slimdom.XMLSerializer().serializeToString(testCase);
							it(description, assertFn).timeout(60000);
						} catch (e) {
							console.error(e);
							continue;
						}
					}
				}
			);
		});

	after(() => {
		console.log(`Writing a log of ${log.length}`);
		testFs.writeFileSync('unrunnableTestCases.csv', log.join('\n'));
	});
});
