import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { evaluateXPath, evaluateXPathToFirstNode, evaluateXPathToString } from 'fontoxpath';

describe("rejecting unsupported AST's (js-codegen)", () => {
	const document = new slimdom.Document();
	jsonMlMapper.parse(
		[
			'xml',
			{ id: 'yes' },
			['title', 'Tips'],
			['tips', ['tip', 'Make it work'], ['tip', 'Make it right'], ['tip', 'Make it fast']],
		],
		document
	);
	it('rejects XQuery', () => {
		chai.assert.throws(() => {
			evaluateXPathToString('text {"Hello"}', document, null, null, {
				backend: 'js-codegen',
				language: evaluateXPath.XQUERY_3_1_LANGUAGE,
			});
		});
	});
	it('falls back on the expression backend when "auto" is set as backend option', () => {
		chai.assert.equal(
			evaluateXPathToString('text {"Hello"}', document, null, null, {
				backend: 'auto',
				language: evaluateXPath.XQUERY_3_1_LANGUAGE,
			}),
			'Hello'
		);
	});
	it('rejects unsupported forward axes in predicates', () => {
		chai.assert.throws(() => {
			evaluateXPathToFirstNode('/[descendant::element(xml)]', document, null, null, {
				backend: 'js-codegen',
			});
		});
		chai.assert.throws(() => {
			evaluateXPathToFirstNode('/[descendant-or-self::element(xml)]', document, null, null, {
				backend: 'js-codegen',
			});
		});
		chai.assert.throws(() => {
			evaluateXPathToFirstNode('/[following-sibling::element(xml)]', document, null, null, {
				backend: 'js-codegen',
			});
		});
		chai.assert.throws(() => {
			evaluateXPathToFirstNode('/[following::element(xml)]', document, null, null, {
				backend: 'js-codegen',
			});
		});
		chai.assert.throws(() => {
			evaluateXPathToFirstNode('/[namespace::element(xml)]', document, null, null, {
				backend: 'js-codegen',
			});
		});
	});
	it('rejects unsupported reverse axes', () => {
		chai.assert.throws(() => {
			evaluateXPathToFirstNode('/[ancestor::element(xml)]', document, null, null, {
				backend: 'js-codegen',
			});
		});
		chai.assert.throws(() => {
			evaluateXPathToFirstNode('/[preceding-sibling::element(xml)]', document, null, null, {
				backend: 'js-codegen',
			});
		});
		chai.assert.throws(() => {
			evaluateXPathToFirstNode('/[preceding::element(xml)]', document, null, null, {
				backend: 'js-codegen',
			});
		});
		chai.assert.throws(() => {
			evaluateXPathToFirstNode('/[ancestor-or-self::element(xml)]', document, null, null, {
				backend: 'js-codegen',
			});
		});
	});
	it('rejects wildcard with uri', () => {
		chai.assert.throws(() =>
			evaluateXPathToFirstNode('/somenamespace:*', document, null, null, {
				backend: 'js-codegen',
			})
		);
	});
	it('rejects unsupported tests', () => {
		chai.assert.throws(() =>
			evaluateXPathToFirstNode(
				'/xml[self::namespace-node() or self::processing-instruction()]',
				document,
				null,
				null,
				{
					backend: 'js-codegen',
				}
			)
		);
	});
	it('rejects unsupported tests combined with the "or" operator', () => {
		chai.assert.throws(() =>
			evaluateXPathToFirstNode(
				'/xml[self::element(tips) or self::processing-instruction()]',
				document,
				null,
				null,
				{
					backend: 'js-codegen',
				}
			)
		);
	});
	it('rejects unsupported tests combined with the "and" operator', () => {
		chai.assert.throws(() =>
			evaluateXPathToFirstNode(
				'/xml[self::element(xml) and self::processing-instruction()]',
				document,
				null,
				null,
				{
					backend: 'js-codegen',
				}
			)
		);
	});
	it('rejects some name tests', () => {
		chai.assert.throws(() => {
			evaluateXPathToFirstNode('/Q{https://example.com}xml', document, null, null, {
				backend: 'js-codegen',
			});
		});
	});
	it('rejects library modules', () => {
		chai.assert.throws(() => {
			evaluateXPathToFirstNode(
				`
module namespace test = "http://www.example.org/mainmodules.tests#1";

declare %public function test:hello($a) {
"Hello " || $a
};
`,
				null,
				null,
				null,
				{ backend: 'js-codegen' }
			);
		});
	});
});
