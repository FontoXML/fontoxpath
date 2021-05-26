import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('return values', () => {
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

	it('evaluates to boolean', () => {
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen(
				'/xml/element()/text()',
				documentNode,
				null,
				ReturnType.BOOLEAN
			)
		);
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen(
				'/xml/element(tips)/text()',
				documentNode,
				null,
				ReturnType.BOOLEAN
			)
		);
	});

	it('evaluates to nodes', () => {
		const results = evaluateXPathWithJsCodegen(
			'/element()/element()/element()/text()',
			documentNode,
			null,
			ReturnType.NODES
		);
		chai.assert.equal(results.length, 3);
	});

	it('evaluates to first node', () => {
		const node: slimdom.Text = evaluateXPathWithJsCodegen(
			'/element()',
			documentNode,
			null,
			ReturnType.FIRST_NODE
		);
		chai.assert.equal(node, documentNode.firstChild);
	});
});
