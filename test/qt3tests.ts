import * as chai from 'chai';
import {
	CompiledXPathFunction,
	compileXPathToJavaScript,
	evaluateXPathToArray,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
	executeJavaScriptCompiledXPath,
	JavaScriptCompiledXPathResult,
	Language,
	parseScript,
	registerXQueryModule,
	ReturnType,
} from 'fontoxpath';
import { acceptAst, IAstRejected, rejectAst } from 'fontoxpath/jsCodegen/JavaScriptCompiledXPath';
import { Element, Node, XMLSerializer as SlimdomXMLSerializer } from 'slimdom';
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

type AsserterForExpression = (
	xpath: string,
	contextNode: Node,
	variablesInScope: { [s: string]: unknown },
	namespaceResolver: (prefix: string) => string
) => void;

function createAsserterForExpression(
	baseUrl: string,
	assertNode,
	language,
	xmlSerializer: SlimdomXMLSerializer
): AsserterForExpression {
	const nodesFactory = createNodesFactory(assertNode);

	switch (assertNode.localName) {
		case 'all-of': {
			const asserts = evaluateXPathToNodes('*', assertNode, undefined, {}).map(
				(innerAssertNode) =>
					createAsserterForExpression(baseUrl, innerAssertNode, language, xmlSerializer)
			);
			return (xpath: string, contextNode, variablesInScope, namespaceResolver) =>
				asserts.forEach((a) => a(xpath, contextNode, variablesInScope, namespaceResolver));
		}
		case 'any-of': {
			const asserts = evaluateXPathToNodes('*', assertNode, undefined, {}).map(
				(innerAssertNode) =>
					createAsserterForExpression(baseUrl, innerAssertNode, language, xmlSerializer)
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
			const errorCode = evaluateXPathToString('@code', assertNode, undefined, {});
			return (
				xpath: string,
				contextNode: Element,
				variablesInScope: object,
				namespaceResolver: (str: string) => string
			) => {
				chai.assert.throws(
					() => {
						evaluateXPathToString(xpath, contextNode, null, variablesInScope, {
							namespaceResolver,
							nodesFactory,
							language,
							xmlSerializer,
						});
					},
					errorCode === '*' ? /.*/ : new RegExp(errorCode),
					xpath
				);

				chai.assert.throws(
					() => {
						evaluateXPathToString(
							parseScript(
								xpath,
								{ namespaceResolver, nodesFactory, language },
								nodesFactory
							),
							contextNode,
							null,
							variablesInScope,
							{
								namespaceResolver,
								nodesFactory,
								language,
							}
						);
					},
					errorCode === '*' ? /.*/ : new RegExp(errorCode),
					xpath
				);
			};
		}
		case 'assert':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				const result = evaluateXPathToString('.', assertNode, undefined, {});

				chai.assert.isTrue(
					evaluateXPathToBoolean(
						`let $result := (${xpath}) return ${result}`,
						contextNode,
						null,
						variablesInScope,
						{
							namespaceResolver,
							nodesFactory,
							language,
							xmlSerializer,
						}
					),
					xpath
				);

				chai.assert.isTrue(
					evaluateXPathToBoolean(
						parseScript(
							`let $result := (${xpath}) return ${result}`,
							{ namespaceResolver, nodesFactory, language },
							nodesFactory
						),
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
					xpath
				);
			};
		case 'assert-true':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				chai.assert.isTrue(
					evaluateXPathToBoolean(xpath, contextNode, null, variablesInScope, {
						namespaceResolver,
						nodesFactory,
						language,
						xmlSerializer,
					}),
					`Expected XPath ${xpath} to resolve to true`
				);

				chai.assert.isTrue(
					evaluateXPathToBoolean(
						parseScript(
							xpath,
							{ namespaceResolver, language, nodesFactory },
							nodesFactory
						),
						contextNode,
						null,
						variablesInScope,
						{
							namespaceResolver,
							nodesFactory,
							language,
						}
					),
					`Expected preparsed XPath ${xpath} to resolve to true`
				);
			};
		case 'assert-eq': {
			const equalWith = evaluateXPathToString('.', assertNode, undefined, {});
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				chai.assert.isTrue(
					evaluateXPathToBoolean(
						`${xpath} = ${equalWith}`,
						contextNode,
						null,
						variablesInScope,
						{
							namespaceResolver,
							nodesFactory,
							language,
							xmlSerializer,
						}
					),
					`Expected XPath ${xpath} to resolve to ${equalWith}`
				);

				chai.assert.isTrue(
					evaluateXPathToBoolean(
						parseScript(
							`${xpath} = ${equalWith}`,
							{ namespaceResolver, nodesFactory, language },
							nodesFactory
						),
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
					`Expected preparsed XPath ${xpath} to resolve to ${equalWith}`
				);
			};
		}
		case 'assert-deep-eq': {
			const equalWith = evaluateXPathToString('.', assertNode, undefined, {});
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				chai.assert.isTrue(
					evaluateXPathToBoolean(
						`deep-equal((${xpath}), (${equalWith}))`,
						contextNode,
						null,
						variablesInScope,
						{
							namespaceResolver,
							nodesFactory,
							language,
							xmlSerializer,
						}
					),
					`Expected XPath ${xpath} to (deep equally) resolve to ${equalWith}`
				);

				chai.assert.isTrue(
					evaluateXPathToBoolean(
						parseScript(
							`deep-equal((${xpath}), (${equalWith}))`,
							{ namespaceResolver, nodesFactory, language },
							nodesFactory
						),
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
					`Expected preparsed XPath ${xpath} to (deep equally) resolve to ${equalWith}`
				);
			};
		}
		case 'assert-empty':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				chai.assert.isTrue(
					evaluateXPathToBoolean(
						`(${xpath}) => empty()`,
						contextNode,
						null,
						variablesInScope,
						{
							namespaceResolver,
							nodesFactory,
							language,
							xmlSerializer,
						}
					),
					`Expected XPath ${xpath} to resolve to the empty sequence`
				);

				chai.assert.isTrue(
					evaluateXPathToBoolean(
						parseScript(
							`(${xpath}) => empty()`,
							{ namespaceResolver, nodesFactory, language },
							nodesFactory
						),
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
					`Expected preparsed XPath ${xpath} to resolve to the empty sequence`
				);
			};
		case 'assert-false':
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				chai.assert.isFalse(
					evaluateXPathToBoolean(xpath, contextNode, null, variablesInScope, {
						namespaceResolver,
						nodesFactory,
						language,
						xmlSerializer,
					}),
					`Expected XPath ${xpath} to resolve to false`
				);

				chai.assert.isFalse(
					evaluateXPathToBoolean(
						parseScript(
							xpath,
							{ namespaceResolver, nodesFactory, language },
							nodesFactory
						),
						contextNode,
						null,
						variablesInScope,
						{
							namespaceResolver,
							nodesFactory,
							language,
						}
					),
					`Expected preparsed XPath ${xpath} to resolve to false`
				);
			};
		case 'assert-count': {
			const expectedCount = evaluateXPathToNumber('number(.)', assertNode, undefined, {});
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				chai.assert.equal(
					evaluateXPathToNumber(
						`(${xpath}) => count()`,
						contextNode,
						null,
						variablesInScope,
						{
							namespaceResolver,
							nodesFactory,
							language,
							xmlSerializer,
						}
					),
					expectedCount,
					`Expected ${xpath} to resolve to ${expectedCount}`
				);

				chai.assert.equal(
					evaluateXPathToNumber(
						parseScript(
							`(${xpath}) => count()`,
							{ namespaceResolver, nodesFactory, language },
							nodesFactory
						),
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
					expectedCount,
					`Expected preparsed ${xpath} to resolve to ${expectedCount}`
				);
			};
		}
		case 'assert-type': {
			const expectedType = evaluateXPathToString('.', assertNode, undefined, {});
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				chai.assert.isTrue(
					evaluateXPathToBoolean(
						`(${xpath}) instance of ${expectedType}`,
						contextNode,
						null,
						variablesInScope,
						{
							namespaceResolver,
							nodesFactory,
							language,
							xmlSerializer,
						}
					),
					`Expected XPath ${xpath} to resolve to something of type ${expectedType}`
				);

				chai.assert.isTrue(
					evaluateXPathToBoolean(
						parseScript(
							`(${xpath}) instance of ${expectedType}`,
							{ namespaceResolver, nodesFactory, language },
							nodesFactory
						),
						contextNode,
						null,
						variablesInScope,
						{ namespaceResolver, nodesFactory, language }
					),
					`Expected preparsed XPath ${xpath} to resolve to something of type ${expectedType}`
				);
			};
		}
		case 'assert-xml': {
			let parsedFragment;
			if (
				evaluateXPathToBoolean('@file', assertNode, undefined, {
					xmlSerializer,
				})
			) {
				parsedFragment = getFile(
					evaluateXPathToString('$baseUrl || "/" || @file', assertNode, null, {
						baseUrl,
						xmlSerializer,
					})
				);
			} else {
				parsedFragment = parser.parseFromString(
					`<xml>${evaluateXPathToString('.', assertNode, undefined, {
						xmlSerializer,
					})}</xml>`
				).documentElement;
			}
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				const results = evaluateXPathToNodes(xpath, contextNode, null, variablesInScope, {
					namespaceResolver,
					nodesFactory,
					language,
					xmlSerializer,
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
							xmlSerializer,
						}
					),
					`Expected XPath ${xpath} to resolve to the given XML. Expected ${results
						.map((result) => new SlimdomXMLSerializer().serializeToString(result))
						.join(' ')} to equal ${
						parsedFragment.nodeType === parsedFragment.DOCUMENT_FRAGMENT_NODE
							? parsedFragment.childNodes
									.map((n) => new slimdom.XMLSerializer().serializeToString(n))
									.join(' ')
							: parsedFragment.innerHTML
					}`
				);

				const resultsWithPreparsedQuery = evaluateXPathToNodes(
					parseScript(xpath, { namespaceResolver, language, nodesFactory }, nodesFactory),
					contextNode,
					null,
					variablesInScope,
					{
						namespaceResolver,
						nodesFactory,
						language,
					}
				) as Node[];

				chai.assert(
					evaluateXPathToBoolean(
						'deep-equal($a, $b)',
						null,
						null,
						{
							a: resultsWithPreparsedQuery,
							b: Array.from(parsedFragment.childNodes),
						},
						{}
					),
					`Expected preparsed XPath ${xpath} to resolve to the given XML. Expected ${resultsWithPreparsedQuery
						.map((result) => new SlimdomXMLSerializer().serializeToString(result))
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
				xmlSerializer,
			});
			return (xpath, contextNode, variablesInScope, namespaceResolver) => {
				chai.assert.equal(
					evaluateXPathToString(`${xpath}`, contextNode, null, variablesInScope, {
						namespaceResolver,
						nodesFactory,
						language,
						xmlSerializer,
					}),
					expectedString,
					xpath
				);
			};
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
	assertNode: Element,
	language: Language
): (
	xpath: string,
	contextNode: Node,
	variablesInScope: { [s: string]: unknown },
	namespaceResolver: (prefix: string) => string,
	that: Mocha.TestFunction
) => JavaScriptCompiledXPathResult {
	const nodesFactory = createNodesFactory(assertNode);

	switch (assertNode.localName) {
		case 'all-of': {
			const asserts = evaluateXPathToNodes<Element>('*', assertNode, undefined, {
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
			const asserts = evaluateXPathToNodes<Element>('*', assertNode, undefined, {
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
			const errorCode = evaluateXPathToString('@code', assertNode, undefined, {});
			return (
				xpath: string,
				contextNode: Element,
				_variablesInScope: { [s: string]: unknown },
				namespaceResolver: (str: string) => string,
				that
			): JavaScriptCompiledXPathResult => {
				for (const returnType of [
					ReturnType.STRING,
					ReturnType.BOOLEAN,
					ReturnType.NODES,
					ReturnType.FIRST_NODE,
				]) {
					chai.assert.throws(
						() => {
							const compiled = compileXPathToJavaScript(xpath, returnType, {
								namespaceResolver,
								language,
							});
							if (compiled.isAstAccepted === true) {
								// tslint:disable-next-line
								const fn = new Function(compiled.code) as CompiledXPathFunction;
								executeJavaScriptCompiledXPath(fn, contextNode);
							} else {
								that.skip(`Skipped: ${compiled.reason}`);
							}
						},
						errorCode === '*' ? /.*/ : new RegExp(errorCode),
						xpath
					);

					try {
						const compiled = compileXPathToJavaScript(xpath, returnType, {
							namespaceResolver,
							language,
						});
						return compiled;
					} catch (e) {
						that.skip(`Skipped`);
					}
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
					const fn = new Function(compiled.code) as CompiledXPathFunction<
						Node,
						ReturnType.BOOLEAN
					>;
					chai.assert.isTrue(
						executeJavaScriptCompiledXPath(fn, contextNode),
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
					const fn = new Function(compiled.code) as CompiledXPathFunction<
						Node,
						ReturnType.BOOLEAN
					>;
					chai.assert.isTrue(
						executeJavaScriptCompiledXPath(fn, contextNode),
						`Expected XPath ${xpath} to resolve to true`
					);
				}
				return compiled;
			};
		case 'assert-eq': {
			const equalWith = evaluateXPathToString('.', assertNode, undefined, {
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
				if (xpath.startsWith('fn:count(')) {
					xpath = xpath.substring(9, xpath.length - 1);
				}

				let compiled: JavaScriptCompiledXPathResult;
				try {
					compiled = compileXPathToJavaScript(xpath, ReturnType.NODES, {
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
					const fn = new Function(compiled.code) as CompiledXPathFunction<
						Node,
						ReturnType.NODES
					>;
					chai.assert.equal(
						executeJavaScriptCompiledXPath(fn, contextNode).length,
						parseInt(equalWith, 10),
						`Expected XPath ${xpath} to resolve to ${equalWith}`
					);
				}
				return compiled;
			};
		}
		case 'assert-deep-eq': {
			const equalWith = evaluateXPathToString('.', assertNode, undefined, {
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
					const fn = new Function(compiled.code) as CompiledXPathFunction<
						Node,
						ReturnType.NODES
					>;
					chai.assert.deepEqual(
						executeJavaScriptCompiledXPath(fn, contextNode),
						evaluateXPathToNodes(equalWith, contextNode, null, variablesInScope, {
							namespaceResolver,
							nodesFactory,
							language,
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
					const fn = new Function(compiled.code) as CompiledXPathFunction<
						Node,
						ReturnType.NODES
					>;
					chai.assert.equal(
						executeJavaScriptCompiledXPath(fn, contextNode).length,
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
					const fn = new Function(compiled.code) as CompiledXPathFunction<
						Node,
						ReturnType.BOOLEAN
					>;
					chai.assert.isFalse(
						executeJavaScriptCompiledXPath(fn, contextNode),
						`Expected XPath ${xpath} to resolve to false`
					);
				}
				return compiled;
			};
		case 'assert-count': {
			const expectedCount = evaluateXPathToNumber('number(.)', assertNode, undefined, {
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
					const fn = new Function(compiled.code) as CompiledXPathFunction<
						Node,
						ReturnType.NODES
					>;
					chai.assert.equal(
						executeJavaScriptCompiledXPath(fn, contextNode).length,
						expectedCount,
						`Expected ${xpath} to resolve to ${expectedCount}`
					);
				}
				return compiled;
			};
		}
		case 'assert-type': {
			const expectedType = evaluateXPathToString('.', assertNode, undefined, {
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
					const fn = new Function(compiled.code) as CompiledXPathFunction<
						Node,
						ReturnType.ANY
					>;
					chai.assert.equal(
						typeof executeJavaScriptCompiledXPath(fn, contextNode),
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
					language,
				})
			) {
				parsedFragment = getFile(
					evaluateXPathToString('$baseUrl || "/" || @file', assertNode, null, {
						baseUrl,
						language,
					})
				);
			} else {
				parsedFragment = parser.parseFromString(
					`<xml>${evaluateXPathToString('.', assertNode, undefined, {
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
					const fn = new Function(compiled.code) as CompiledXPathFunction<
						Node,
						ReturnType.NODES
					>;
					const results = executeJavaScriptCompiledXPath(fn, contextNode);
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
								language,
							}
						),
						`Expected XPath ${xpath} to resolve to the given XML. Expected ${results
							.map((result) => new SlimdomXMLSerializer().serializeToString(result))
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
					const fn = new Function(compiled.code) as CompiledXPathFunction<
						Node,
						ReturnType.STRING
					>;
					chai.assert.equal(
						executeJavaScriptCompiledXPath(fn, contextNode),
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
	testCase: Element,
	language: Language,
	xmlSerializer?: SlimdomXMLSerializer
) {
	const assertNode = evaluateXPathToFirstNode<Element>('./result/*', testCase, undefined);
	return createAsserterForExpression(baseUrl, assertNode, language, xmlSerializer);
}

function getJsCodegenBackendAsserterForTest(
	baseUrl: string,
	testCase: Element,
	language: Language
) {
	const assertNode = evaluateXPathToFirstNode<Element>('./result/*', testCase, undefined, {});
	return createAsserterForJsCodegen(baseUrl, assertNode, language);
}

const registeredModuleURIByFileName = Object.create(null);

function getTestName(testCase: Element) {
	return evaluateXPathToString('./@name', testCase, undefined, {});
}

function getTestDescription(testSetName: string, testName: string, testCase: Element) {
	return (
		testSetName +
		'~' +
		testName +
		'~' +
		evaluateXPathToString(
			'if (description/text()) then description else test',
			testCase,
			undefined,
			{}
		)
	);
}

function loadModule(testCase: Element, baseUrl: string) {
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

		registeredModuleURIByFileName[moduleImport.file] = targetNamespace;
	});
}

describe('qt3 test set', () => {
	const reportJSCodeGen = process.argv.includes('--reportcodegencases');
	const forceJSCodeGen = process.argv.includes('--forcecodegen');
	const successfulJSCodegenCases: string[] = [];
	const unsuccessfulJSCodegenCases: string[] = [];
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
		const testCases = evaluateXPathToNodes<Element>(ALL_TESTS_QUERY, testSet);
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
									new slimdom.XMLSerializer()
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
								successfulJSCodegenCases.push(getTestName(testCase));
							} else if (compiled) {
								unsuccessfulJSCodegenCases.push(
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
			let report = 'successFulCases: \n\n';
			report += successfulJSCodegenCases.join('\n');
			report += '\n\nunsuccessFulCases: \n\n';
			report += unsuccessfulJSCodegenCases.join('\n');

			testFs.writeFileSync('jsCodeGenReport.csv', report);
			// tslint:disable-next-line: no-console
			console.log(
				unsuccessfulJSCodegenCases.length + successfulJSCodegenCases.length,
				' tests have been run involving jscodegen and ',
				successfulJSCodegenCases.length,
				' tests have been succesfully compiled and executed with the JavaScript code generation'
			);
		}
	});
});
