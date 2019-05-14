import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { evaluateXPath, evaluateXPathToMap, evaluateXPathToNodes, IDomFacade, getBucketsForNode } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('following', () => {
	it('returns the next sibling', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someElement'], ['someSiblingElement', ['someSiblingElement']]],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'following::someSiblingElement',
				documentNode.documentElement.firstChild
			),
			[
				documentNode.documentElement.lastChild,
				documentNode.documentElement.lastChild.lastChild
			]
		);
	});

	it('returns all the following nodes', () => {
		const result = evaluateXPathToMap(
			`
let $dom := <element>
	<uncle>
		<nephew>
			<nephew/>
		</nephew>
	</uncle>
	<parent>
		<sibling>
			<nephew/>
		</sibling>
		<self>
			<child/>
		</self>
		<sibling expectedFollowing="true">
			<nephew expectedFollowing="true"/>
		</sibling>
	</parent>
	<uncle expectedFollowing="true">
		<nephew expectedFollowing="true">
			<nephew expectedFollowing="true"/>
		</nephew>
	</uncle>
</element>

return map{
	"got": array{$dom!descendant::self[1]!following::*},
	"expected": array{$dom/descendant-or-self::*[@expectedFollowing]}
}
`,
			documentNode,
			null,
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);
		chai.assert.equal(result.got.length, 5);
		chai.assert.equal(result.expected.length, 5);
		chai.assert.deepEqual(result.got, result.expected);
	});

	it('does not return non-matching siblings', () => {
		jsonMlMapper.parse(
			[
				'someParentElement',
				['someElement'],
				['someNonMatchingElement', ['someNonMatchingElement']]
			],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'following::someSiblingElement',
				documentNode.documentElement.firstChild
			),
			[]
		);
	});

	it('does nothing when there are no following siblings', () => {
		jsonMlMapper.parse(['someParentElement', ['someElement']], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'following::someSiblingElement',
				documentNode.documentElement.firstChild
			),
			[]
		);
	});

	it.only('passes buckets for following', () => {
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

		const results = evaluateXPathToNodes('following::secondChildElement', firstChildNode, testDomFacade);
		chai.assert.deepEqual(results, [firstChildNode.nextSibling], 'following');
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('following::*', null), 'XPDY0002');
	});
});
