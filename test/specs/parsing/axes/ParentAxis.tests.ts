import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	getBucketForSelector,
	IDomFacade
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('parent', () => {
	it('returns the parentNode', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someElement', { someAttribute: 'someValue' }]],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'parent::someParentElement',
				documentNode.documentElement.firstChild
			),
			[documentNode.documentElement]
		);
	});

	it('returns nothing for root nodes', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someElement', { someAttribute: 'someValue' }]],
			documentNode
		);
		chai.assert.deepEqual(evaluateXPathToNodes('parent::node()', documentNode), []);
	});

	it('passes buckets for getParentNode', () => {
		jsonMlMapper.parse(['parentElement', ['childElement']], documentNode);

		const childNode = documentNode.firstChild.firstChild;
		const expectedBucket = getBucketForSelector('self::parentElement');

		const testDomFacade: IDomFacade = {
			getParentNode: (node: slimdom.Node, bucket: string|null) => {
				chai.assert.equal(expectedBucket, bucket);
				return null;
			}
		} as any;

		evaluateXPathToFirstNode('parent::parentElement', childNode, testDomFacade);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('parent::*', null), 'XPDY0002');
	});
});
