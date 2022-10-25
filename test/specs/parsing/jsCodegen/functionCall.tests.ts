import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { domFacade, registerCustomXPathFunction, ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('function calls', () => {
	let documentNode: slimdom.Document;

	before(() => {
		registerCustomXPathFunction(
			{ localName: 'functionCallTest', namespaceURI: 'test' },
			['xs:string', 'xs:boolean?', 'node()'],
			'node()?',
			({ domFacade }, str, bool, node) => (bool ? domFacade.getFirstChild(node) : null)
		);
		registerCustomXPathFunction(
			{ localName: 'functionCallWithItem', namespaceURI: 'test' },
			['item()?'],
			'xs:boolean',
			(_dynamicContext, item) => !!item
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
					['tip', { id: 'last' }, 'Make it fast'],
				],
			],
			documentNode
		);
	});

	it('can call selected built-in functions through the runtimeLib', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'fontoxpath:version()',
				documentNode,
				null,
				ReturnType.STRING
			),
			'devbuild'
		);
	});

	it('can codegen specific functions directly', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen('not(name(/bla))', documentNode, null, ReturnType.BOOLEAN),
			true
		);
	});

	it('can call custom functions through the runtimeLib', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'Q{test}functionCallTest("a", true(), root(.))',
				documentNode.firstChild.lastChild,
				null,
				ReturnType.FIRST_NODE
			),
			documentNode.firstChild
		);
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'Q{test}functionCallTest("a", xml/nope, .)',
				documentNode.firstChild.lastChild,
				null,
				ReturnType.FIRST_NODE
			),
			null
		);
	});

	it('can call functions with item() arguments, which accept all supported types', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'Q{test}functionCallWithItem(true())',
				null,
				null,
				ReturnType.BOOLEAN
			),
			true
		);
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'Q{test}functionCallWithItem("a")',
				null,
				null,
				ReturnType.BOOLEAN
			),
			true
		);
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'Q{test}functionCallWithItem(/xml)',
				documentNode,
				null,
				ReturnType.BOOLEAN
			),
			true
		);
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'Q{test}functionCallWithItem(/nope)',
				documentNode,
				null,
				ReturnType.BOOLEAN
			),
			false
		);
	});

	it('can call functions at the end of a path', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'xml/tips/tip[@id="last"]/local-name()',
				documentNode,
				null,
				ReturnType.STRING
			),
			'tip'
		);
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'xml/tips/tip[@id="last"]/path(.)',
				documentNode,
				null,
				ReturnType.STRING
			),
			'/Q{}xml[1]/Q{}tips[1]/Q{}tip[3]'
		);
	});
});
