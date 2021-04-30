import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import evaluateXPathToBoolean from '../../../src/evaluateXPathToBoolean';
import evaluateXPathToFirstNode from '../../../src/evaluateXPathToFirstNode';
import evaluateXPathToNodes from '../../../src/evaluateXPathToNodes';

describe('return values', () => {
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
	it('evaluates to boolean', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean('/xml/element()/text()', document, null, null, {
				backend: 'js-codegen',
			})
		);
		chai.assert.isFalse(
			evaluateXPathToBoolean('/xml/element(tips)/text()', document, null, null, {
				backend: 'js-codegen',
			})
		);
	});
	it('evaluates to nodes', () => {
		const results = evaluateXPathToNodes(
			'/element()/element()/element()/text()',
			document,
			null,
			null,
			{ backend: 'js-codegen' }
		);
		chai.assert.equal(results.length, 3);
	});
	it('evaluates to first node', () => {
		const node: slimdom.Text = evaluateXPathToFirstNode(
			'/element()',
			document,
			null,
			null,
			{ backend: 'js-codegen' }
		);
		chai.assert.equal(node, document.firstChild);
	});
});
