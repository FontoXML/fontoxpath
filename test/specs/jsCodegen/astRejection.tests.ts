import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

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

	it('rejects unsupported reverse axes in predicates', () => {
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

	it('rejects unsupported tests', () => {
		chai.assert.throws(
			() =>
				evaluateXPathWithJsCodegen(
					'/processing-instruction()',
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
		}, 'Unsupported');
	});

	it('rejects unsupported return types', () => {
		chai.assert.throws(() => {
			evaluateXPathWithJsCodegen('/xml', documentNode, null, ReturnType.ANY);
			evaluateXPathWithJsCodegen('/xml', documentNode, null, ReturnType.NUMBER);
			evaluateXPathWithJsCodegen('/xml', documentNode, null, ReturnType.STRING);
			evaluateXPathWithJsCodegen('/xml', documentNode, null, ReturnType.STRINGS);
			evaluateXPathWithJsCodegen('/xml', documentNode, null, ReturnType.MAP);
			evaluateXPathWithJsCodegen('/xml', documentNode, null, ReturnType.ARRAY);
			evaluateXPathWithJsCodegen('/xml', documentNode, null, ReturnType.NUMBERS);
			evaluateXPathWithJsCodegen('/xml', documentNode, null, ReturnType.MAP);
		}, 'Unsupported');
	});
});
