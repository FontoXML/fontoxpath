import * as chai from 'chai';
import {
	CompiledXPathFunction,
	compileXPathToJavaScript,
	evaluateXPath,
	evaluateXPathToArray,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
	executeJavaScriptCompiledXPath,
	JavaScriptCompiledXPathResult,
	Language,
	registerXQueryModule,
	ReturnType,
} from 'fontoxpath';
import {
	acceptAst,
	IAstRejected,
	PartialCompilationResult,
	rejectAst,
} from 'fontoxpath/jsCodegen/JavaScriptCompiledXPath';
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

function createNodesFactory(assertNode: Node) {
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
	return nodesFactory;
}

function createAsserterForExpression(baseUrl: string, assertNode, language, annotateAst: boolean) {
	const nodesFactory = createNodesFactory(assertNode);

	switch (assertNode.localName) {
		case 'all-of': {
			const asserts = evaluateXPathToNodes('*', assertNode, undefined, {
				annotateAst: false,
			}).map((innerAssertNode) =>
				createAsserterForExpression(baseUrl, innerAssertNode, language, annotateAst)
			);
			return (xpath: string, contextNode, variablesInScope, namespaceResolver) =>
				asserts.forEach((a) => a(xpath, contextNode, variablesInScope, namespaceResolver));
		}
		case 'any-of': {
			const asserts = evaluateXPathToNodes('*', assertNode, undefined, {
				annotateAst: false,
			}).map((innerAssertNode) =>
				createAsserterForExpression(baseUrl, innerAssertNode, language, annotateAst)
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
			const errorCode = evaluateXPathToString('@code', assertNode, undefined, {
				annotateAst: false,
			});
			return (
				xpath: string,
				contextNode: Element,
				variablesInScope: object,
				namespaceResolver: (str: string) => string
			) =>
				chai.assert.throws(
					() => {
						evaluateXPathToString(xpath, contextNode, null, variablesInScope, {
							namespaceResolver,
							nodesFactory,
							language,
							annotateAst,
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
							assertNode,
							undefined,
							{
								annotateAst,
							}
						)}`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language, annotateAst: false }
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
						annotateAst,
					}),
					`Expected XPath ${xpath} to resolve to true`
				);
		case 'assert-eq': {
			const equalWith = evaluateXPathToString('.', assertNode, undefined, {
				annotateAst: false,
			});
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.isTrue(
					evaluateXPathToBoolean(
						`${xpath} = ${equalWith}`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language, annotateAst: annotateAst }
					),
					`Expected XPath ${xpath} to resolve to ${equalWith}`
				);
		}
		case 'assert-deep-eq': {
			const equalWith = evaluateXPathToString('.', assertNode, undefined, {
				annotateAst: false,
			});
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.isTrue(
					evaluateXPathToBoolean(
						`deep-equal((${xpath}), (${equalWith}))`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language, annotateAst: annotateAst }
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
						{ namespaceResolver, nodesFactory, language, annotateAst: annotateAst }
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
						annotateAst,
					}),
					`Expected XPath ${xpath} to resolve to false`
				);
		case 'assert-count': {
			const expectedCount = evaluateXPathToNumber('number(.)', assertNode, undefined, {
				annotateAst: false,
			});
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.equal(
					evaluateXPathToNumber(
						`(${xpath}) => count()`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language, annotateAst: annotateAst }
					),
					expectedCount,
					`Expected ${xpath} to resolve to ${expectedCount}`
				);
		}
		case 'assert-type': {
			const expectedType = evaluateXPathToString('.', assertNode, undefined, {
				annotateAst: false,
			});
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.isTrue(
					evaluateXPathToBoolean(
						`(${xpath}) instance of ${expectedType}`,
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language, annotateAst: annotateAst }
					),
					`Expected XPath ${xpath} to resolve to something of type ${expectedType}`
				);
		}
		case 'assert-xml': {
			let parsedFragment;
			if (
				evaluateXPathToBoolean('@file', assertNode, undefined, {
					annotateAst,
				})
			) {
				parsedFragment = getFile(
					evaluateXPathToString('$baseUrl || "/" || @file', assertNode, null, {
						baseUrl,
						annotateAst,
					})
				);
			} else {
				parsedFragment = parser.parseFromString(
					`<xml>${evaluateXPathToString('.', assertNode, undefined, {
						annotateAst,
					})}</xml>`
				).documentElement;
			}
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				const results = evaluateXPathToNodes(xpath, contextNode, null, variablesInScope, {
					namespaceResolver,
					nodesFactory,
					language,
					annotateAst,
				}) as Node[];
				chai.assert(
					evaluateXPathToBoolean(
						'deep-equal($a, $b)',
						null,
						null,
						{
							a: results,
							b: Array.from(parsedFragment.childNodes),
						},
						{
							annotateAst,
						}
					),
					`Expected XPath ${xpath} to resolve to the given XML. Expected ${results
						.map((result) => new XMLSerializer().serializeToString(result))
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
			const expectedString = evaluateXPathToString('.', assertNode, undefined, {
				annotateAst: false,
			});
			return (xpath, contextNode, variablesInScope, namespaceResolver) =>
				chai.assert.equal(
					evaluateXPathToString(`${xpath}`, contextNode, null, variablesInScope, {
						namespaceResolver,
						nodesFactory,
						language,
						annotateAst,
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

/*
 * Assertions for the js-codegen backend.
 *
 * Contains workarounds for the js-codegen not supporting parts of the asserted
 * queries, such as functions and comparisons.
 */
function createAsserterForJsCodegen(
	baseUrl: string,
	assertNode,
	language
): (
	xpath,
	contextNode,
	variablesInScope,
	namespaceResolver,
	that
) => JavaScriptCompiledXPathResult {
	const nodesFactory = createNodesFactory(assertNode);

	switch (assertNode.localName) {
		case 'all-of': {
			const asserts = evaluateXPathToNodes('*', assertNode, undefined, {
				annotateAst: false,
				language,
			}).map((innerAssertNode) =>
				createAsserterForJsCodegen(baseUrl, innerAssertNode, language)
			);
			let isAstAccepted = true;
			let isTestAstAccepted: JavaScriptCompiledXPathResult;
			return (
				xpath,
				contextNode,
				variablesInScope,
				namespaceResolver,
				that
			): JavaScriptCompiledXPathResult => {
				asserts.forEach((a) => {
					isTestAstAccepted = a(
						xpath,
						contextNode,
						variablesInScope,
						namespaceResolver,
						that
					);
					if (!isTestAstAccepted.isAstAccepted) {
						isAstAccepted = false;
					}
				});
				if (isAstAccepted) {
					return acceptAst(undefined, undefined);
				} else {
					return rejectAst((isTestAstAccepted as IAstRejected).reason);
				}
			};
		}
		case 'any-of': {
			const asserts = evaluateXPathToNodes('*', assertNode, undefined, {
				annotateAst: false,
				language,
			}).map((innerAssertNode) =>
				createAsserterForJsCodegen(baseUrl, innerAssertNode, language)
			);
			let isAstAccepted = true;
			return (
				xpath,
				contextNode,
				variablesInScope,
				namespaceResolver,
				that
			): JavaScriptCompiledXPathResult => {
				const errors = [];
				chai.assert(
					asserts.some((a) => {
						try {
							const isTestAstAccepted = a(
								xpath,
								contextNode,
								variablesInScope,
								namespaceResolver,
								that
							);
							if (!isTestAstAccepted.isAstAccepted) {
								isAstAccepted = false;
							}
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
				if (isAstAccepted) {
					return acceptAst(undefined, undefined);
				} else {
					return rejectAst('one of the testcases causes it to fail');
				}
			};
		}
		case 'error': {
			const errorCode = evaluateXPathToString('@code', assertNode, undefined, {
				annotateAst: false,
			});
			return (
				xpath: string,
				contextNode: Element,
				variablesInScope: object,
				namespaceResolver: (str: string) => string,
				that
			): JavaScriptCompiledXPathResult => {
				chai.assert.throws(
					() => {
						const compiled = compileXPathToJavaScript(xpath, ReturnType.NODES, {
							namespaceResolver,
							language,
						});
						if (compiled.isAstAccepted === true) {
							// tslint:disable-next-line
							const fn = new Function(compiled.code) as CompiledXPathFunction;
							executeJavaScriptCompiledXPath(
								fn,
								contextNode,
								null,
								compiled.staticContext
							);
						} else {
							that.skip(`Skipped: ${compiled.reason}`);
						}
					},
					errorCode === '*' ? /.*/ : new RegExp(errorCode),
					xpath
				);
				try {
					const compiled = compileXPathToJavaScript(xpath, ReturnType.NODES, {
						namespaceResolver,
						language,
					});
					return compiled;
				} catch (e) {
					that.skip(`Skipped`);
				}
			};
		}
		case 'assert':
			return (
				xpath,
				contextNode,
				variablesInScope,
				namespaceResolver,
				that
			): JavaScriptCompiledXPathResult => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.BOOLEAN, {
					namespaceResolver,
					language,
				});
				if (compiled.isAstAccepted === true) {
					// tslint:disable-next-line
					const fn = new Function(compiled.code) as CompiledXPathFunction;
					chai.assert.isTrue(
						executeJavaScriptCompiledXPath(
							fn,
							contextNode,
							null,
							compiled.staticContext
						),
						`Expected XPath ${xpath} to resolve to true`
					);
				}
				return compiled;
			};
		case 'assert-true':
			return (
				xpath,
				contextNode,
				variablesInScope,
				namespaceResolver,
				that
			): JavaScriptCompiledXPathResult => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.BOOLEAN, {
					namespaceResolver,
					language,
				});
				if (compiled.isAstAccepted === true) {
					// tslint:disable-next-line
					const fn = new Function(compiled.code) as CompiledXPathFunction;
					chai.assert.isTrue(
						executeJavaScriptCompiledXPath(
							fn,
							contextNode,
							null,
							compiled.staticContext
						),
						`Expected XPath ${xpath} to resolve to true`
					);
				}
				return compiled;
			};
		case 'assert-eq': {
			const equalWith = evaluateXPathToString('.', assertNode, undefined, {
				annotateAst: false,
				language,
			});
			return (
				xpath,
				contextNode,
				variablesInScope,
				namespaceResolver,
				that
			): JavaScriptCompiledXPathResult => {
				// Strip away fn:count to make tests possible that would
				// otherwise be unsupported. Workaround for js-codegen not
				// supporting functions.
				// if (xpath.startsWith('fn:count(')) {
				// 	xpath = xpath.substring(9, xpath.length - 1);
				// }

				let compiled: JavaScriptCompiledXPathResult;
				try {
					compiled = compileXPathToJavaScript(xpath, ReturnType.STRING, {
						namespaceResolver,
						language,
					});
				} catch (e) {
					// Parser error caused by substringing the query earlier.
					if (e.toString().includes('XPST0003')) {
						that.skip('Skippped: parser error.');
					}
				}
				if (compiled.isAstAccepted === true) {
					// tslint:disable-next-line
					const fn = new Function(compiled.code) as CompiledXPathFunction;
					chai.assert.equal(
						executeJavaScriptCompiledXPath(
							fn,
							contextNode,
							null,
							compiled.staticContext
						),
						equalWith,
						`Expected XPath ${xpath} to resolve to ${equalWith}`
					);
				}
				return compiled;
			};
		}
		case 'assert-deep-eq': {
			const equalWith = evaluateXPathToString('.', assertNode, undefined, {
				annotateAst: false,
				language,
			});
			return (
				xpath,
				contextNode,
				variablesInScope,
				namespaceResolver,
				that
			): JavaScriptCompiledXPathResult => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.ANY, {
					namespaceResolver,
					language,
				});
				if (compiled.isAstAccepted === true) {
					// tslint:disable-next-line
					const fn = new Function(compiled.code) as CompiledXPathFunction;
					chai.assert.deepEqual(
						executeJavaScriptCompiledXPath(
							fn,
							contextNode,
							null,
							compiled.staticContext
						),
						evaluateXPath(equalWith, contextNode, null, variablesInScope, null, {
							namespaceResolver,
							nodesFactory,
							language,
							annotateAst: false,
						}),
						`Expected XPath ${xpath} to (deep equally) resolve to ${equalWith}`
					);
				}
				return compiled;
			};
		}
		case 'assert-empty':
			return (
				xpath,
				contextNode,
				variablesInScope,
				namespaceResolver,
				that
			): JavaScriptCompiledXPathResult => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.NODES, {
					namespaceResolver,
					language,
				});
				if (compiled.isAstAccepted === true) {
					// tslint:disable-next-line
					const fn = new Function(compiled.code) as CompiledXPathFunction;
					chai.assert.equal(
						executeJavaScriptCompiledXPath(
							fn,
							contextNode,
							null,
							compiled.staticContext
						).length,
						0,
						`Expected XPath ${xpath} to resolve to the empty sequence`
					);
				}
				return compiled;
			};
		case 'assert-false':
			return (
				xpath,
				contextNode,
				variablesInScope,
				namespaceResolver,
				that
			): JavaScriptCompiledXPathResult => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.BOOLEAN, {
					namespaceResolver,
					language,
				});
				if (compiled.isAstAccepted === true) {
					// tslint:disable-next-line
					const fn = new Function(compiled.code) as CompiledXPathFunction;
					chai.assert.isFalse(
						executeJavaScriptCompiledXPath(
							fn,
							contextNode,
							null,
							compiled.staticContext
						),
						`Expected XPath ${xpath} to resolve to false`
					);
				}
				return compiled;
			};
		case 'assert-count': {
			const expectedCount = evaluateXPathToNumber('number(.)', assertNode, undefined, {
				annotateAst: false,
				language,
			});
			return (
				xpath,
				contextNode,
				variablesInScope,
				namespaceResolver,
				that
			): JavaScriptCompiledXPathResult => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.NODES, {
					namespaceResolver,
					language,
				});
				if (compiled.isAstAccepted === true) {
					// tslint:disable-next-line
					const fn = new Function(compiled.code) as CompiledXPathFunction;
					chai.assert.equal(
						executeJavaScriptCompiledXPath(
							fn,
							contextNode,
							null,
							compiled.staticContext
						).length,
						expectedCount,
						`Expected ${xpath} to resolve to ${expectedCount}`
					);
				}
				return compiled;
			};
		}
		case 'assert-type': {
			const expectedType = evaluateXPathToString('.', assertNode, undefined, {
				annotateAst: false,
				language,
			});
			return (
				xpath,
				contextNode,
				variablesInScope,
				namespaceResolver,
				that
			): JavaScriptCompiledXPathResult => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.ANY, {
					namespaceResolver,
					language,
				});
				if (compiled.isAstAccepted === true) {
					// tslint:disable-next-line
					const fn = new Function(compiled.code) as CompiledXPathFunction;
					chai.assert.equal(
						typeof executeJavaScriptCompiledXPath(
							fn,
							contextNode,
							null,
							compiled.staticContext
						),
						expectedType,
						`Expected ${xpath} to resolve to type: ${expectedType}`
					);
				}
				return compiled;
			};
		}
		case 'assert-xml': {
			let parsedFragment;
			if (
				evaluateXPathToBoolean('@file', assertNode, undefined, {
					annotateAst: false,
					language,
				})
			) {
				parsedFragment = getFile(
					evaluateXPathToString('$baseUrl || "/" || @file', assertNode, null, {
						baseUrl,
						annotateAst: false,
						language,
					})
				);
			} else {
				parsedFragment = parser.parseFromString(
					`<xml>${evaluateXPathToString('.', assertNode, undefined, {
						annotateAst: false,
						language,
					})}</xml>`
				).documentElement;
			}
			return (
				xpath,
				contextNode,
				variablesInScope,
				namespaceResolver,
				that
			): JavaScriptCompiledXPathResult => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.NODES, {
					namespaceResolver,
					language,
				});
				if (compiled.isAstAccepted === true) {
					// tslint:disable-next-line
					const fn = new Function(compiled.code) as CompiledXPathFunction;
					const results = executeJavaScriptCompiledXPath(
						fn,
						contextNode,
						null,
						compiled.staticContext
					);
					chai.assert(
						evaluateXPathToBoolean(
							'deep-equal($a, $b)',
							null,
							null,
							{
								a: results,
								b: Array.from(parsedFragment.childNodes),
							},
							{
								annotateAst: false,
								language,
							}
						),
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
				}
				return compiled;
			};
		}
		case 'assert-string-value': {
			const expectedString = evaluateXPathToString('.', assertNode, undefined, {
				annotateAst: false,
				language,
			});
			return (
				xpath,
				contextNode,
				variablesInScope,
				namespaceResolver,
				that
			): JavaScriptCompiledXPathResult => {
				const compiled = compileXPathToJavaScript(xpath, ReturnType.STRING, {
					namespaceResolver,
					language,
				});
				if (compiled.isAstAccepted === true) {
					// tslint:disable-next-line
					const fn = new Function(compiled.code) as CompiledXPathFunction;
					chai.assert.equal(
						executeJavaScriptCompiledXPath(
							fn,
							contextNode,
							null,
							compiled.staticContext
						),
						expectedString,
						`Expected ${xpath} to resolve to ${expectedString}`
					);
				}
				return compiled;
			};
		}
		default:
			return (): JavaScriptCompiledXPathResult => {
				chai.assert.fail(null, null, `Skipped test, it was a ${assertNode.localName}`);
			};
	}
}

function getExpressionBackendAsserterForTest(
	baseUrl: string,
	testCase,
	language: Language,
	annotateAst: boolean
) {
	const assertNode = evaluateXPathToFirstNode('./result/*', testCase, undefined, {
		annotateAst,
	});
	return createAsserterForExpression(baseUrl, assertNode, language, annotateAst);
}

function getJsCodegenBackendAsserterForTest(baseUrl: string, testCase, language) {
	const assertNode = evaluateXPathToFirstNode('./result/*', testCase, undefined, {
		annotateAst: false,
	});
	return createAsserterForJsCodegen(baseUrl, assertNode, language);
}

const registeredModuleURIByFileName = Object.create(null);

function getTestName(testCase) {
	return evaluateXPathToString('./@name', testCase, undefined, {
		annotateAst: false,
	});
}

function getTestDescription(testSetName, testName, testCase) {
	return (
		testSetName +
		'~' +
		testName +
		'~' +
		evaluateXPathToString(
			'if (description/text()) then description else test',
			testCase,
			undefined,
			{
				annotateAst: false,
			}
		)
	);
}

function loadModule(testCase, baseUrl) {
	// Load the module within the try to catch any errors from the module
	const moduleImports = evaluateXPathToArray(
		'array{module!map{"uri": @uri/string(), "file": $baseUrl || "/" || @file/string()}}',
		testCase,
		null,
		{
			baseUrl,
			annotateAst: false,
		}
	);
	moduleImports.forEach((moduleImport) => {
		const targetNamespace =
			registeredModuleURIByFileName[moduleImport.file] ||
			registerXQueryModule(getFile(moduleImport.file) as string);

		registeredModuleURIByFileName[moduleImport.file] = targetNamespace;
	});
}

describe('qt3 test set', () => {
	const annotateAst = process.argv.includes('--annotate');
	const reportJSCodeGen = process.argv.includes('--reportcodegencases');
	const forceJSCodeGen = process.argv.includes('--forcecodegen');
	const succesfullJSCodegenCases: string[] = [];
	const unsuccesfullJSCodegenCases: string[] = [];
	if (annotateAst) {
		// tslint:disable-next-line: no-console
		console.log('Running tests using annotation');
	}
	if (reportJSCodeGen) {
		// tslint:disable-next-line: no-console
		console.log('Reporting the amount of code executed with the code generation');
	}
	if (forceJSCodeGen) {
		// tslint:disable-next-line: no-console
		console.log('Forcing the tests to run with the codeGen');
	}
	const expressionBackendLog = unrunnableTestCases;
	getAllTestSets().forEach((testSetFileName) => {
		const testSet = getFile(testSetFileName);

		const testSetName = evaluateXPathToString('/test-set/@name', testSet);

		// Find all the tests we can run
		const testCases: Node[] = evaluateXPathToNodes(ALL_TESTS_QUERY, testSet);
		if (!testCases.length) {
			return;
		}
		const testName = evaluateXPathToString(
			'/test-set/@name || /test-set/description!(if (string()) then "~" || . else "")',
			testSet
		);

		if (!forceJSCodeGen) {
			describe(`${testName} (expression backend)`, function () {
				this.timeout(60000);
				for (const testCase of testCases) {
					const name = getTestName(testCase);
					const description = getTestDescription(testSetName, name, testCase);

					if (unrunnableTestCasesByName[name]) {
						it.skip(`${unrunnableTestCasesByName[name]}. (${description})`);
						continue;
					}

					try {
						// tslint:disable-next-line
						const assertFn = function () {
							const {
								baseUrl,
								contextNode,
								testQuery,
								language,
								namespaceResolver,
								variablesInScope,
							} = getArguments(testSetFileName, testCase);

							try {
								loadModule(testCase, baseUrl);

								const asserter = getExpressionBackendAsserterForTest(
									baseUrl,
									testCase,
									language,
									annotateAst
								);
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

								expressionBackendLog.push(
									`${name},${e.toString().replace(/\n/g, ' ').trim()}`
								);

								// And rethrow the error
								throw e;
							}
						};

						assertFn.toString = () =>
							new slimdom.XMLSerializer().serializeToString(testCase);

						it(`${description}`, assertFn).timeout(60000);
					} catch (e) {
						// tslint:disable-next-line: no-console
						console.error(e);
						continue;
					}
				}
			});
		}

		describe(`${testName} (js-codegen backend)`, function () {
			this.timeout(60000);
			for (const testCase of testCases) {
				const name = getTestName(testCase);
				const description = getTestDescription(testSetName, name, testCase);

				if (unrunnableTestCasesByName[name]) {
					it.skip(`${unrunnableTestCasesByName[name]}. (${description})`);
					continue;
				}

				try {
					// tslint:disable-next-line
					const assertFn = function () {
						const {
							baseUrl,
							contextNode,
							testQuery,
							language,
							namespaceResolver,
							variablesInScope,
						} = getArguments(testSetFileName, testCase);

						try {
							loadModule(testCase, baseUrl);

							const asserter = getJsCodegenBackendAsserterForTest(
								baseUrl,
								testCase,
								language
							);

							const compiled = asserter(
								testQuery,
								contextNode,
								variablesInScope,
								namespaceResolver,
								this
							);
							if (compiled && compiled.isAstAccepted) {
								succesfullJSCodegenCases.push(getTestName(testCase));
							} else if (compiled) {
								unsuccesfullJSCodegenCases.push(
									getTestName(testCase) + ' ' + (compiled as IAstRejected).reason
								);
								if (forceJSCodeGen) {
									throw new Error(
										`Failed to convert to jsCodeGen: ${
											(compiled as IAstRejected).reason
										}`
									);
								}
								this.skip(`Skipped: ${(compiled as IAstRejected).reason}`);
							} else {
								this.skip();
							}
						} catch (e) {
							if (e instanceof TypeError) {
								throw e;
							}

							// And rethrow the error
							throw e;
						}
					};

					assertFn.toString = () =>
						new slimdom.XMLSerializer().serializeToString(testCase);

					it(description, assertFn).timeout(60000);
				} catch (e) {
					// tslint:disable-next-line: no-console
					console.error(e);
					continue;
				}
			}
		});
	});

	after(() => {
		// tslint:disable-next-line: no-console
		console.log(`Writing a log of ${expressionBackendLog.length}`);
		testFs.writeFileSync('unrunnableTestCases.csv', expressionBackendLog.join('\n'));
		if (reportJSCodeGen) {
			let report = 'succesFullCases: \n\n';
			report += succesfullJSCodegenCases.join('\n');
			report += '\n\nunsuccesFullCases: \n\n';
			report += unsuccesfullJSCodegenCases.join('\n');

			testFs.writeFileSync('jsCodeGenReport.csv', report);
			// tslint:disable-next-line: no-console
			console.log(
				unsuccesfullJSCodegenCases.length + succesfullJSCodegenCases.length,
				' tests have been run involving jscodegen and ',
				succesfullJSCodegenCases.length,
				' tests have been succesfully compiled and executed with the JavaScript code generation'
			);
		}
	});
});
