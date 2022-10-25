import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { registerCustomXPathFunction, ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe("rejecting unsupported AST's (js-codegen)", () => {
	let documentNode: slimdom.Document;

	before(() => {
		registerCustomXPathFunction(
			{ localName: 'customFunctionAcceptsMultiple', namespaceURI: 'test' },
			['item()*'],
			'xs:boolean',
			(_dynamicContext, _items) => true
		);
		registerCustomXPathFunction(
			{ localName: 'customFunctionAcceptsDate', namespaceURI: 'test' },
			['xs:date?'],
			'xs:boolean',
			(_dynamicContext, _date) => true
		);
		registerCustomXPathFunction(
			{ localName: 'customFunctionReturnsDate', namespaceURI: 'test' },
			[],
			'xs:date?',
			(_dynamicContext, date) => null
		);
	});

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

	it('rejects unsupported function (boolean)', () => {
		chai.assert.throws(
			() =>
				evaluateXPathWithJsCodegen(
					'boolean(/xml) and self::element(xml)',
					documentNode,
					null,
					ReturnType.BOOLEAN
				),
			'Not supported: built-in function not on allow list: boolean#1'
		);
	});

	it('rejects function calls with unsupported arguments', () => {
		// Sequences that allow more than one item not supported as arguments
		chai.assert.throws(
			() =>
				evaluateXPathWithJsCodegen(
					'Q{test}customFunctionAcceptsMultiple(/xml/*)',
					documentNode,
					null,
					ReturnType.BOOLEAN
				),
			'Not supported: sequence arguments with multiple items'
		);
		// Types not supported by codegen not supported as arguments
		chai.assert.throws(
			() =>
				evaluateXPathWithJsCodegen(
					'Q{test}customFunctionAcceptsDate("bla")',
					null,
					null,
					ReturnType.BOOLEAN
				),
			'Argument types not supported: xs:string -> xs:date'
		);
		// Types not supported by codegen not supported as return type
		chai.assert.throws(
			() =>
				evaluateXPathWithJsCodegen(
					'Q{test}customFunctionReturnsDate()',
					null,
					null,
					ReturnType.BOOLEAN
				),
			'Function return type xs:date not supported'
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
