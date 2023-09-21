import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { evaluateXPathToNodes, getBucketForSelector, IDomFacade } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('following-sibling', () => {
	it('returns the next sibling', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someElement'], ['someSiblingElement']],
			documentNode,
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'following-sibling::someSiblingElement',
				documentNode.documentElement.firstChild,
			),
			[documentNode.documentElement.lastChild],
		);
	});

	it('does not return non-matching siblings', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someElement'], ['someNonMatchingElement']],
			documentNode,
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'following-sibling::someSiblingElement',
				documentNode.documentElement.firstChild,
			),
			[],
		);
	});

	it('passes buckets for followingSibling', () => {
		jsonMlMapper.parse(
			['parentElement', ['firstChildElement'], ['secondChildElement']],
			documentNode,
		);

		const firstChildNode = documentNode.firstChild.firstChild;
		const expectedBucket = getBucketForSelector('self::secondChildElement');

		const testDomFacade: IDomFacade = {
			getFirstChild: (node: slimdom.Node, bucket: string | null) => {
				chai.assert.equal(expectedBucket, bucket);
				return node.firstChild;
			},
			getNextSibling: (node: slimdom.Node, bucket: string | null) => {
				chai.assert.equal(expectedBucket, bucket);
				return node.nextSibling;
			},
			getParentNode: (node: slimdom.Node, bucket: string | null) => {
				chai.assert.equal(expectedBucket, bucket);
				return node.parentNode;
			},
		} as any;

		evaluateXPathToNodes(
			'following-sibling::secondChildElement',
			firstChildNode,
			testDomFacade,
		);
	});

	it('passes intersecting buckets for followingSibling', () => {
		jsonMlMapper.parse(
			['parentElement', ['firstChildElement'], ['secondChildElement']],
			documentNode,
		);

		const firstChildNode = documentNode.firstChild.firstChild;
		const expectedBucket = getBucketForSelector('self::secondChildElement');

		const testDomFacade: IDomFacade = {
			getFirstChild: (node: slimdom.Node, bucket: string | null) => {
				chai.assert.equal(expectedBucket, bucket);
				return node.firstChild;
			},
			getNextSibling: (node: slimdom.Node, bucket: string | null) => {
				chai.assert.equal(expectedBucket, bucket);
				return node.nextSibling;
			},
			getParentNode: (node: slimdom.Node, bucket: string | null) => {
				chai.assert.equal(expectedBucket, bucket);
				return node.parentNode;
			},
		} as any;

		evaluateXPathToNodes(
			'following-sibling::*[self::secondChildElement]',
			firstChildNode,
			testDomFacade,
		);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('following-sibling::*', null), 'XPDY0002');
	});
});
