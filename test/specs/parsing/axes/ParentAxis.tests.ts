import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes, getBucketsForNode, IDomFacade, evaluateXPathToFirstNode
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('parent', () => {
	it('returns the parentNode', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', { someAttribute: 'someValue' }]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('parent::someParentElement', documentNode.documentElement.firstChild), [documentNode.documentElement]);
	});

	it('returns nothing for root nodes', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', { someAttribute: 'someValue' }]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('parent::node()', documentNode), []);
	});

	it('passes buckets for getParentNode', () => {
		jsonMlMapper.parse([
			'parentElement',
			['childElement']
		], documentNode);

		const parentNode = documentNode.firstChild;
		const childNode = documentNode.firstChild.firstChild;

		const testDomFacade: IDomFacade = {
			getParentNode: (node, bucket) => {
				chai.assert.notEqual(bucket, null, 'There must be a bucket passed!');
				return getBucketsForNode(node.parentNode).includes(bucket) ? node.parentNode : null;
			}
		} as any;

		const result = evaluateXPathToFirstNode('parent::parentElement', childNode, testDomFacade);
		chai.assert.equal(result, parentNode, 'parent node');
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('parent::*', null), 'XPDY0002');
	});
});
