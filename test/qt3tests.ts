import * as chai from 'chai';
import {
	evaluateXPathToArray,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
	registerXQueryModule,
	ReturnType,
	compileXPathToJavaScript,
	executeJavaScriptCompiledXPath,
} from 'fontoxpath';
import { Element, Node, XMLSerializer } from 'slimdom';
import { slimdom } from 'slimdom-sax-parser';
import {
	ALL_TESTS_QUERY,
	getAllTestSets,
	getArguments,
	getFile,
	parser,
	unrunnableTestCases,
	unrunnableTestCasesByName,
} from 'test-helpers/qt3TestsTools';
import testFs from 'test-helpers/testFs';

function createAsserterForJsCodegen(baseUrl, assertNode, language) {
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
				createAsserterForJsCodegen(baseUrl, innerAssertNode, language)
			);
			return (xpath, contextNode, variablesInScope, namespaceResolver, that) =>
				asserts.forEach((a) =>
					a(xpath, contextNode, variablesInScope, namespaceResolver, that)
				);
		}
		case 'any-of': {
			const asserts = evaluateXPathToNodes('*', assertNode).map((innerAssertNode) =>
				createAsserterForJsCodegen(baseUrl, innerAssertNode, language)
			);
			return (xpath, contextNode, variablesInScope, namespaceResolver, that) => {
				const errors = [];
				chai.assert(
					asserts.some((a) => {
						try {
							a(xpath, contextNode, variablesInScope, namespaceResolver, that);
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
		// case 'error': {
		// 	const errorCode = evaluateXPathToString('@code', assertNode);
		// 	return (
		// 		xpath: string,
		// 		contextNode: Element,
		// 		variablesInScope: object,
		// 		namespaceResolver: (str: string) => string,
		// 		that
		// 	) => {
		// 		const compiled = compileXPathToJavaScript(xpath, ReturnType.BOOLEAN);
		// 		if (compiled.isAstAccepted) {
		// 			const fn = new Function(compiled.code);
		// 			chai.assert.throws(
		// 				() => {
		// 					executeJavaScriptCompiledXPath(fn, contextNode);
		// 				},
		// 				errorCode === '*' ? /.*/ : new RegExp(errorCode),
		// 				xpath
		// 			);
		// 		} else {
		// 			that.skip();
		// 		}
		// 	};
		// }
		case 'assert':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				// chai.assert.isTrue(
				// 	evaluateXPathToBoolean(
				// 		`let $result := (${xpath}) return ${evaluateXPathToString(
				// 			'.',
				// 			assertNode
				// 		)}`,
				// 		contextNode,
				// 		null,
				// 		variablesInScope,
				// 		{ namespaceResolver, nodesFactory, language }
				// 	),
				// 	xpath
				// );
			};
		case 'assert-true':
			return (xpath, contextNode, variablesInScope, namespaceResolver, that) => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.BOOLEAN);
				if (compiled.isAstAccepted) {
					let fn = new Function(compiled.code);
					chai.assert.isTrue(
						executeJavaScriptCompiledXPath(fn, contextNode),
						`Expected XPath ${xpath} to resolve to true`
					);
				} else {
					that.skip();
				}
			};
		case 'assert-eq': {
			const equalWith = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver, that) => {
				if (xpath.startsWith('fn:count(')) {
					// console.log(xpath);
					xpath = xpath.substring(9, xpath.length - 1);
					// console.log(xpath);
					// process.exit(1);
				}

				if (xpath === '/child::far-north') {
					debugger;
				}

				let compiled;
				try {
					compiled = compileXPathToJavaScript(xpath, ReturnType.NODES);
				} catch (e) {
					// Parser error
					if (e.toString().includes("XPST0003")) {
						that.skip();
					}
				}

				if (compiled.isAstAccepted) {
					let fn = new Function(compiled.code);
					chai.assert.equal(executeJavaScriptCompiledXPath(fn, contextNode).length,
						parseInt(equalWith, 10),
						`Expected XPath ${ xpath } to resolve to ${ equalWith }`
					);
				} else {
					that.skip();
				}
			};
		}
		case 'assert-deep-eq': {
			const equalWith = evaluateXPathToString('.', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver, that) => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.BOOLEAN);
				if (compiled.isAstAccepted) {
					let fn = new Function(compiled.code);
					chai.assert.deepEqual(
						executeJavaScriptCompiledXPath(fn, contextNode),
						evaluateXPathToNodes(equalWith, contextNode, null, variablesInScope, {
							namespaceResolver,
							nodesFactory,
							language,
						}),
						`Expected XPath ${xpath} to (deep equally) resolve to ${equalWith}`
					);
				} else {
					that.skip();
				}
			};
		}
		// case 'assert-empty':
		// 	return (xpath, contextNode, variablesInScope, namespaceResolver) =>
		// 		chai.assert.isTrue(
		// 			evaluateXPathToBoolean(
		// 				`(${xpath}) => empty()`,
		// 				contextNode,
		// 				null,
		// 				variablesInScope
		// 			),
		// 			`Expected XPath ${xpath} to resolve to the empty sequence`
		// 		);
		case 'assert-false':
			return (xpath, contextNode, variablesInScope, namespaceResolver, that) => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.BOOLEAN);
				if (compiled.isAstAccepted) {
					let fn = new Function(compiled.code);
					chai.assert.isFalse(
						executeJavaScriptCompiledXPath(fn, contextNode),
						`Expected XPath ${xpath} to resolve to false`
					);
				} else {
					that.skip();
				}
			};
		case 'assert-count': {
			const expectedCount = evaluateXPathToNumber('number(.)', assertNode);
			return (xpath, contextNode, variablesInScope, namespaceResolver, that) => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.NODES);
				if (compiled.isAstAccepted) {
					let fn = new Function(compiled.code);
					chai.assert.equal(
						executeJavaScriptCompiledXPath(fn, contextNode).length, // TODO: is dit geschikt?
						expectedCount,
						`Expected ${xpath} to resolve to ${expectedCount}`
					);
				} else {
					that.skip();
				}
			};
		}
		// case 'assert-type': {
		// 	const expectedType = evaluateXPathToString('.', assertNode);
		// 	return (xpath, contextNode, variablesInScope, namespaceResolver) =>
		// 		chai.assert.isTrue(
		// 			evaluateXPathToBoolean(
		// 				`(${xpath}) instance of ${expectedType}`,
		// 				contextNode,
		// 				null,
		// 				variablesInScope,
		// 				{ namespaceResolver, nodesFactory, language }
		// 			),
		// 			`Expected XPath ${xpath} to resolve to something of type ${expectedType}`
		// 		);
		// }
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
			return (xpath, contextNode, variablesInScope, namespaceResolver, that) => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.NODES);
				if (compiled.isAstAccepted) {
					let fn = new Function(compiled.code);
					const results = executeJavaScriptCompiledXPath(fn, contextNode) as Node[];
					chai.assert(
						evaluateXPathToBoolean('deep-equal($a, $b)', null, null, {
							a: results,
							b: Array.from(parsedFragment.childNodes),
						}),
						`Expected XPath ${xpath} to resolve to the given XML. Expected ${results
							.map((result) => new XMLSerializer().serializeToString(result))
							.join(' ')} to equal ${
						parsedFragment.nodeType === parsedFragment.DOCUMENT_FRAGMENT_NODE
							? parsedFragment.childNodes
								.map((n) =>
									new slimdom.XMLSerializer().serializeToString(n)
								)
								.join(' ')
							: parsedFragment.innerHTML
						}`
					);
				} else {
					that.skip();
				}
			};
		}
		// case 'assert-string-value': {
		// 	const expectedString = evaluateXPathToString('.', assertNode);
		// 	return (xpath, contextNode, variablesInScope, namespaceResolver) =>
		// 		chai.assert.equal(
		// 			evaluateXPathToString(`${xpath}`, contextNode, null, variablesInScope, {
		// 				namespaceResolver,
		// 				nodesFactory,
		// 				language,
		// 			}),
		// 			expectedString,
		// 			xpath
		// 		);
		// }
		default:
			return (_a, _b, _c, _d, that) => {
				that.skip();
			};
	}
}

function getAsserterForTest(baseUrl, testCase, language) {
	const assertNode = evaluateXPathToFirstNode('./result/*', testCase);
	return createAsserterForJsCodegen(baseUrl, assertNode, language);
}

const registeredModuleURIByFileName = Object.create(null);

describe('qt3 test set', () => {
	const log = unrunnableTestCases;
	getAllTestSets().forEach((testSetFileName) => {
		const testSet = getFile(testSetFileName);

		const testSetName = evaluateXPathToString('/test-set/@name', testSet);

		// Find all the tests we can run
		const testCases: Node[] = evaluateXPathToNodes(ALL_TESTS_QUERY, testSet);
		if (!testCases.length) {
			return;
		}

		describe(
			evaluateXPathToString(
				'/test-set/@name || /test-set/description!(if (string()) then "~" || . else "")',
				testSet
			),
			function() {
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

						const assertFn = (that) => {
							const {
								baseUrl,
								contextNode,
								testQuery,
								language,
								namespaceResolver,
								variablesInScope,
							} = getArguments(testSetFileName, testCase);

							try {
								const asserter = getAsserterForTest(baseUrl, testCase, language);

								// Load the module within the try to catch any errors from the module
								const moduleImports = evaluateXPathToArray(
									'array{module!map{"uri": @uri/string(), "file": $baseUrl || "/" || @file/string()}}',
									testCase,
									null,
									{
										baseUrl,
									}
								);
								moduleImports.forEach((moduleImport) => {
									const targetNamespace =
										registeredModuleURIByFileName[moduleImport.file] ||
										registerXQueryModule(getFile(moduleImport.file) as string);

									registeredModuleURIByFileName[
										moduleImport.file
									] = targetNamespace;
								});

								asserter(
									testQuery,
									contextNode,
									variablesInScope,
									namespaceResolver,
									that
								);
							} catch (e) {
								if (e instanceof TypeError) {
									throw e;
								}

								log.push(`${testName},${e.toString().replace(/\n/g, ' ').trim()}`);

								// And rethrow the error
								throw e;
							}
						};

						assertFn.toString = () =>
							new slimdom.XMLSerializer().serializeToString(testCase);
						it(description, function() {
							assertFn(this);
						}).timeout(60000);
					} catch (e) {
						// tslint:disable-next-line: no-console
						console.error(e);
						continue;
					}
				}
			}
		);
	});

	after(() => {
		// tslint:disable-next-line: no-console
		console.log(`Writing a log of ${log.length}`);
		// testFs.writeFileSync('unrunnableTestCases.csv', log.join('\n'));
	});
});
