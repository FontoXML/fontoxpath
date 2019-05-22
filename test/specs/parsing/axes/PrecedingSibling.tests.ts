import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { evaluateXPathToNodes, getBucketsForNode, IDomFacade } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('preceding-sibling', () => {
	it('returns the previous sibling', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someSiblingElement'], ['someElement']],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'preceding-sibling::someSiblingElement',
				documentNode.documentElement.lastChild
			),
			[documentNode.documentElement.firstChild]
		);
	});

	it('does not return non-matching siblings', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someNonMatchingElement'], ['someElement']],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'preceding-sibling::someSiblingElement',
				documentNode.documentElement.lastChild
			),
			[]
		);
	});

	it('passes buckets for preceding-sibling', () => {
		jsonMlMapper.parse(
			['parentElement', ['firstChildElement'], ['secondChildElement']],
			documentNode
		);

		const secondChildNode = documentNode.firstChild.lastChild;

		const testDomFacade: IDomFacade = {
			getLastChild: (node: slimdom.Node, bucket: string|null) => {
				return null;
			},
			getParentNode: (node: slimdom.Node, bucket: string|null) => {
				return null;
			},
			getPreviousSibling: (node: slimdom.Node, bucket: string|null) => {
				chai.assert.include(getBucketsForNode(node.previousSibling), bucket, 'It includes bucket');
				return null;
			}
		} as any;

		evaluateXPathToNodes(
			'preceding-sibling::firstChildElement',
			secondChildNode,
			testDomFacade
		);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('preceding-sibling::*', null), 'XPDY0002');
	});
});
