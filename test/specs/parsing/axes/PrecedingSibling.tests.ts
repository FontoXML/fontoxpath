import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes, IDomFacade, getBucketsForNode
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('preceding-sibling', () => {
	it('returns the previous sibling', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someSiblingElement'],
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('preceding-sibling::someSiblingElement', documentNode.documentElement.lastChild), [documentNode.documentElement.firstChild]);
	});

	it('does not return non-matching siblings', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someNonMatchingElement'],
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('preceding-sibling::someSiblingElement', documentNode.documentElement.lastChild), []);
	});

	it('passes buckets for preceding-sibling', () => {
		jsonMlMapper.parse([
			'parentElement',
			['firstChildElement'],
			['secondChildElement']
		], documentNode);

		const secondChildNode = documentNode.firstChild.lastChild;

		const testDomFacade: IDomFacade = {
			getPreviousSibling: (node, bucket) => {
				chai.assert.notEqual(bucket, null, 'There must be a bucket passed!');
				return node.previousSibling ?
					(getBucketsForNode(node.previousSibling).includes(bucket) ? node.previousSibling : null) :
					null;
			},
			getParentNode: (node, bucket) => {
				chai.assert.notEqual(bucket, null, 'There must be a bucket passed!');
				return node.parentNode
			},
			getLastChild: (node, bucket) => {
				chai.assert.notEqual(bucket, null, 'There must be a bucket passed!');
				return node.lastChild ?
					(getBucketsForNode(node.lastChild).includes(bucket) ? node.lastChild : null) :
					null;
			}
		} as any;

		const results = evaluateXPathToNodes('preceding-sibling::firstChildElement', secondChildNode, testDomFacade);
		chai.assert.deepEqual(results, [secondChildNode.previousSibling], 'following');
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('preceding-sibling::*', null), 'XPDY0002');
	});
});
