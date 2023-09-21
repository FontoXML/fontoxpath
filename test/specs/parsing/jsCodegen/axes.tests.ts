import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('axes (js-codegen)', () => {
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
			documentNode,
		);
	});

	it('compiles the self axis', () => {
		const xmlNode: slimdom.Node = documentNode.firstChild;
		chai.assert.equal(
			evaluateXPathWithJsCodegen('self::xml', xmlNode, null, ReturnType.FIRST_NODE),
			xmlNode,
		);
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen('self::p', xmlNode, null, ReturnType.BOOLEAN),
		);
	});

	describe('attribute axis', () => {
		it('compiles the attribute axis directly, to a string', () => {
			chai.assert.equal(
				evaluateXPathWithJsCodegen(
					'@id',
					documentNode.documentElement,
					null,
					ReturnType.STRING,
				),
				'yes',
			);
		});

		it('compiles the attribute axis combined with a childaxis', () => {
			chai.assert.isTrue(
				evaluateXPathWithJsCodegen('/xml/@id', documentNode, null, ReturnType.BOOLEAN),
			);
		});

		it('evaluates the attribute axis and handles absence of attributes', () => {
			documentNode = new slimdom.Document();
			jsonMlMapper.parse(['xml', 'Some text'], documentNode);

			const xmlNode: any = documentNode.firstChild;

			chai.assert.isFalse(
				evaluateXPathWithJsCodegen('@attribute or @id', xmlNode, null, ReturnType.BOOLEAN),
			);
		});
	});

	it('compiles the parent axis', () => {
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen(
				'/xml/tips/parent::element(xml)',
				documentNode,
				null,
				ReturnType.BOOLEAN,
			),
		);
	});

	it('compiles attribute nametests with URILiterals (Q{})', () => {
		const ele = documentNode.createElement('test');
		ele.setAttributeNS('http://example.com', 'ns-attr', 'value');
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'@Q{http://example.com}ns-attr',
				ele,
				null,
				ReturnType.STRING,
			),
			'value',
		);
	});

	it('Correctly handles attribute predicates', () => {
		const ele = documentNode.createElementNS('http://www.example.com', 'test');
		ele.setAttribute('present', 'value');
		chai.assert.equal(
			evaluateXPathWithJsCodegen('self::test[@present]', ele, null, ReturnType.BOOLEAN, {
				namespaceResolver: (_prefix) => 'http://www.example.com',
			}),
			true,
		);
	});
});
