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

describe('following-sibling', () => {
	it('returns the next sibling', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement'],
			['someSiblingElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('following-sibling::someSiblingElement', documentNode.documentElement.firstChild), [documentNode.documentElement.lastChild]);
	});

	it('does not return non-matching siblings', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement'],
			['someNonMatchingElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('following-sibling::someSiblingElement', documentNode.documentElement.firstChild), []);
	});

	it('passes buckets for followingSibling', () => {
		jsonMlMapper.parse([
			'parentElement',
			['firstChildElement'],
			['secondChildElement']
		], documentNode);

		const firstChildNode = documentNode.firstChild.firstChild;

		const testDomFacade: IDomFacade = {
			getNextSibling: (node, bucket) => {
				chai.assert.notEqual(bucket, null, 'There must be a bucket passed!');
				return node.nextSibling ?
					(getBucketsForNode(node.nextSibling).includes(bucket) ? node.nextSibling : null) :
					null;
			},
			getParentNode: (node, bucket) => {
				chai.assert.notEqual(bucket, null, 'There must be a bucket passed!');
				return node.parentNode
			},
			getFirstChild: (node, bucket) => {
				chai.assert.notEqual(bucket, null, 'There must be a bucket passed!');
				return node.firstChild ?
					(getBucketsForNode(node.firstChild).includes(bucket) ? node.firstChild : null) :
					null;
			}
		} as any;

		const results = evaluateXPathToNodes('following-sibling::secondChildElement', firstChildNode, testDomFacade);
		chai.assert.deepEqual(results, [firstChildNode.nextSibling], 'following');
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('following-sibling::*', null), 'XPDY0002');
	});
});
