import * as chai from 'chai';
import {
	domFacade,
	evaluateXPath,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToNumber,
	evaluateXPathToString,
	parseScript,
	registerCustomXPathFunction,
} from 'fontoxpath';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('extension functions', () => {
	describe('fontoxpath:version()', () => {
		it('returns the version', () => {
			try {
				chai.assert.equal(evaluateXPathToString('fontoxpath:version()'), 'devbuild');
			} catch (_error) {
				chai.assert.match(evaluateXPathToString('fontoxpath:version()'), /\d+\.\d+\.\d+/);
			}
		});
	});
	describe('fontoxpath:evaluate()', () => {
		function identityNamespaceResolver(prefix: string) {
			return prefix;
		}

		before(() => {
			registerCustomXPathFunction(
				{ namespaceURI: 'test', localName: 'custom-function-static-string-func-error' },
				[],
				'xs:string',
				(_dynamicContext) => {
					// This query will throw an error during static evaluation
					return '"prefix-" || string("bla", "bliep") || "-postfix"';
				},
			);

			registerCustomXPathFunction(
				{
					namespaceURI: 'test',
					localName: 'custom-function-dynamic-string-func-error',
				},
				[],
				'xs:string',
				(_dynamicContext) => {
					// This query will throw an error immediately during evaluation
					return '"prefix-" || string(./descendant::text()) || "-postfix"';
				},
			);

			registerCustomXPathFunction(
				{
					namespaceURI: 'test',
					localName: 'custom-function-lazy-dynamic-string-func-error',
				},
				[],
				'xs:string',
				(_dynamicContext) => {
					// This query will throw an error during evaluation when advancing the iterator
					return 'string(./descendant::text())';
				},
			);
		});

		it('can run inline functions', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate("true()", map{})',
					documentNode,
					domFacade,
				),
			));
		it('can iterate over the same sequence, inside the evaluate call', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate("count($x) + count(reverse($x))", map{"x": (1,2,3,4,5)})',
					documentNode,
					domFacade,
				),
			));
		it('can run inline inline functions', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate("fontoxpath:evaluate(""true()"", map{})", map{})',
					documentNode,
					domFacade,
				),
			));
		it('can run inside inline functions', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'function() {fontoxpath:evaluate("true()", map{})}()',
					documentNode,
					domFacade,
				),
			));
		it('accepts parameters', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate("$a", map{"a":true()})',
					documentNode,
					domFacade,
				),
			));
		it('retains namespaces in scope', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate("fun:true()", map{})',
					documentNode,
					domFacade,
					{},
					{
						namespaceResolver: (prefix) =>
							({ fun: 'http://www.w3.org/2005/xpath-functions' })[prefix],
					},
				),
			);
		});
		it('accepts "." as contextItem', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate(".", map{".":true()})',
					documentNode,
					domFacade,
				),
			));
		it('also allows XQuery to be evaluated', () =>
			chai.assert.equal(
				evaluateXPathToNumber(
					'fontoxpath:evaluate("declare default function namespace ""http://www.w3.org/2005/xpath-functions/math""; exp10(3)", map{})',
				),
				1000,
			));

		it('also allows XQueryX programs to be evaluated', () =>
			chai.assert.equal(
				evaluateXPathToNumber(
					`fontoxpath:evaluate(<xqx:module xmlns:xqx="http://www.w3.org/2005/XQueryX" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.w3.org/2005/XQueryX http://www.w3.org/2005/XQueryX/xqueryx.xsd">
    <xqx:mainModule>
      <xqx:queryBody>
        <xqx:integerConstantExpr>
          <xqx:value>42</xqx:value>
        </xqx:integerConstantExpr>
      </xqx:queryBody>
    </xqx:mainModule>
</xqx:module>, map{})`,
					documentNode,
					domFacade,
					null,
					{ language: evaluateXPath.XQUERY_3_1_LANGUAGE },
				),
				42,
			));

		it('throws when passed an XQueryX program with stack traces that throws', () => {
			const expr = parseScript('format-integer($n,"A")', { debug: true }, documentNode);
			chai.assert.throws(
				() =>
					evaluateXPathToString(
						`fontoxpath:evaluate($expr, map{ 'n': 1.2 })`,
						documentNode,
						domFacade,
						{ expr },
						{ language: evaluateXPath.XQUERY_3_1_LANGUAGE, debug: true },
					),
				'XPTY0004',
			);
		});

		it('throws when passed nonsense as an XQueryX program', () =>
			chai.assert.throws(
				() =>
					evaluateXPathToNumber(
						`fontoxpath:evaluate(<nonsense />, map{})`,
						documentNode,
						domFacade,
						null,
						{ language: evaluateXPath.XQUERY_3_1_LANGUAGE },
					),
				'XPTY0004',
			));

		it('throws when passed invalid arguments', () => {
			chai.assert.throws(
				() =>
					evaluateXPathToNumber(
						`fontoxpath:evaluate(42, map{})`,
						documentNode,
						domFacade,
						null,
						{ language: evaluateXPath.XQUERY_3_1_LANGUAGE },
					),
				/XPTY0004/,
				'When passed an integer',
			);

			chai.assert.throws(
				() =>
					evaluateXPathToNumber(
						`fontoxpath:evaluate(map{}, map{})`,
						documentNode,
						domFacade,
						null,
						{ language: evaluateXPath.XQUERY_3_1_LANGUAGE },
					),
				/XPTY0004/,
				'When passed a map',
			);

			chai.assert.throws(
				() =>
					evaluateXPathToNumber(
						`fontoxpath:evaluate(true(), map{})`,
						documentNode,
						domFacade,
						null,
						{ language: evaluateXPath.XQUERY_3_1_LANGUAGE },
					),
				/XPTY0004/,
				'When passed a boolean',
			);
		});

		it('throws for an invalid expression during static evaluation and preserves debug details', () => {
			// Execute a query which executes our registered custom xpath function
			// Test if the error contains the actual failing XPath query

			chai.assert.throws(
				() =>
					evaluateXPathToString(
						'test:custom-function-static-string-func-error() => fontoxpath:evaluate(map{".": .})',
						documentNode,
						null,
						null,
						{
							namespaceResolver: identityNamespaceResolver,
							debug: true,
						},
					),
				// We expect the error message to contain the errored Query which is evaluated by
				// fontoxpath:evaluate
				`1: test:custom-function-static-string-func-error() => fontoxpath:evaluate(map{".": .})
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Inner error:
1: "prefix-" || string("bla", "bliep") || "-postfix"
                ^^^^^^^^^^^^^^^^^^^^^^

Error: XPST0017`,
			);
		});

		it('throws for an invalid expression during evaluation and preserves debug details', () => {
			documentNode = new slimdom.Document();
			jsonMlMapper.parse(['xml', ['a', 'foo'], ['b', 'bar']], documentNode);

			// Execute a query which executes our registered custom xpath function
			// Test if the error contains the actual failing XPath query

			chai.assert.throws(
				() =>
					evaluateXPathToString(
						`test:custom-function-dynamic-string-func-error() => fontoxpath:evaluate(map{".": .})`,
						documentNode,
						null,
						null,
						{
							language: evaluateXPath.XQUERY_3_1_LANGUAGE,
							namespaceResolver: identityNamespaceResolver,
							debug: true,
						},
					),
				// We expect the error message to contain the errored Query which is evaluated by
				// fontoxpath:evaluate
				`1: test:custom-function-dynamic-string-func-error() => fontoxpath:evaluate(map{".": .})
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Inner error:
1: "prefix-" || string(./descendant::text()) || "-postfix"
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Error: XPTY0004`,
			);
		});

		it('throws for an invalid expression during evaluation and preserves debug details when advancing the iterator', () => {
			documentNode = new slimdom.Document();
			jsonMlMapper.parse(['xml', ['a', 'foo'], ['b', 'bar']], documentNode);

			// Execute a query which executes our registered custom xpath function
			// Test if the error contains the actual failing XPath query

			chai.assert.throws(
				() =>
					evaluateXPathToString(
						`test:custom-function-lazy-dynamic-string-func-error() => fontoxpath:evaluate(map{".": .})`,
						documentNode,
						null,
						null,
						{
							language: evaluateXPath.XQUERY_3_1_LANGUAGE,
							namespaceResolver: identityNamespaceResolver,
							debug: true,
						},
					),
				// We expect the error message to contain the errored Query which is evaluated by
				// fontoxpath:evaluate
				`1: test:custom-function-lazy-dynamic-string-func-error() => fontoxpath:evaluate(map{".": .})
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Inner error:
1: string(./descendant::text())
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Error: XPTY0004`,
			);
		});
	});
});
