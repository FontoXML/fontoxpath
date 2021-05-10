import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';
import { ReturnType } from 'fontoxpath';

describe("rejecting unsupported AST's (js-codegen)", () => {
	let documentNode: slimdom.Document;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(
			[
				'xml',
				{ id: 'yes' },
				['title', 'Tips'],
				[
					'tips',
					['tip', 'Make it work'],
					['tip', 'Make it right'],
					['tip', 'Make it fast'],
				],
			],
			documentNode
		);
	});

	it('rejects unsupported forward axes in predicates', () => {
		chai.assert.throws(() => {
			evaluateXPathWithJsCodegen(
				'/xml[descendant::element(xml)]',
				documentNode,
				null,
				ReturnType.BOOLEAN
			);
		}, 'Unsupported');
		chai.assert.throws(() => {
			evaluateXPathWithJsCodegen(
				'/xml[descendant-or-self::element(xml)]',
				documentNode,
				null,
				ReturnType.BOOLEAN
			);
		}, 'Unsupported');
		chai.assert.throws(() => {
			evaluateXPathWithJsCodegen(
				'/xml[following-sibling::element(xml)]',
				documentNode,
				null,
				ReturnType.BOOLEAN
			);
		}, 'Unsupported');
		chai.assert.throws(() => {
			evaluateXPathWithJsCodegen(
				'/xml[following::element(xml)]',
				documentNode,
				null,
				ReturnType.BOOLEAN
			);
		}, 'Unsupported');
	});
	it('rejects unsupported reverse axes', () => {
		chai.assert.throws(() => {
			evaluateXPathWithJsCodegen(
				'/xml[ancestor::element(xml)]',
				documentNode,
				null,
				ReturnType.BOOLEAN
			);
		}, 'Unsupported');
		chai.assert.throws(() => {
			evaluateXPathWithJsCodegen(
				'/xml[preceding-sibling::element(xml)]',
				documentNode,
				null,
				ReturnType.BOOLEAN
			);
		}, 'Unsupported');
		chai.assert.throws(() => {
			evaluateXPathWithJsCodegen(
				'/xml[preceding::element(xml)]',
				documentNode,
				null,

				ReturnType.BOOLEAN
			);
		}, 'Unsupported');
		chai.assert.throws(() => {
			evaluateXPathWithJsCodegen(
				'/xml[ancestor-or-self::element(xml)]',
				documentNode,
				null,
				ReturnType.BOOLEAN
			);
		}, 'Unsupported');
	});
	it('rejects wildcard with uri', () => {
		chai.assert.throws(
			() =>
				evaluateXPathWithJsCodegen(
					'/somenamespace:*',
					documentNode,
					null,
					ReturnType.BOOLEAN
				),
			'Unsupported'
		);
	});
	it('rejects unsupported tests', () => {
		chai.assert.throws(
			() =>
				evaluateXPathWithJsCodegen(
					'/xml[self::namespace-node() or self::processing-instruction()]',
					documentNode,
					null,
					ReturnType.BOOLEAN
				),
			'Unsupported'
		);
	});
	it('rejects unsupported tests combined with the "or" operator', () => {
		chai.assert.throws(
			() =>
				evaluateXPathWithJsCodegen(
					'/xml[self::element(tips) or self::processing-instruction()]',
					documentNode,
					null,
					ReturnType.BOOLEAN
				),
			'Unsupported'
		);
	});
	it('rejects unsupported tests combined with the "and" operator', () => {
		chai.assert.throws(
			() =>
				evaluateXPathWithJsCodegen(
					'/xml[self::element(xml) and self::processing-instruction()]',
					documentNode,
					null,
					ReturnType.BOOLEAN
				),
			'Unsupported'
		);
	});
	it('rejects unsupported base expression (functionCallExpr)', () => {
		chai.assert.throws(
			() =>
				evaluateXPathWithJsCodegen(
					'boolean(/xml) and self::element(xml)',
					documentNode,
					null,
					ReturnType.BOOLEAN
				),
			'Unsupported'
		);
	});
	it('rejects name tests with namespace URI', () => {
		chai.assert.throws(
			() =>
				evaluateXPathWithJsCodegen(
					'/Q{https://example.com}xml',
					documentNode,
					null,
					ReturnType.BOOLEAN
				),

			'Unsupported'
		);
	});
	it('rejects library modules', () => {
		chai.assert.throws(() => {
			evaluateXPathWithJsCodegen(
				`
module namespace test = "http://www.example.org/mainmodules.tests#1";

declare %public function test:hello($a) {
"Hello " || $a
};
`,
				null,
				null,
				ReturnType.BOOLEAN
			);
		});
	});
});
