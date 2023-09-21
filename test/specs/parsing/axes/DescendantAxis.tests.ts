import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { evaluateXPathToNodes, getBucketForSelector, IDomFacade } from 'fontoxpath';
import { Element } from 'fontoxpath/types/Types';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('descendant', () => {
	it('parses descendant::', () => {
		jsonMlMapper.parse(['someParentElement', ['someElement']], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('descendant::someElement', documentNode), [
			documentNode.firstChild.firstChild,
		]);
	});

	it('passes buckets for descendant', () => {
		jsonMlMapper.parse(['parentElement', ['childElement']], documentNode);

		const expectedBucket = 'type-1';

		const testDomFacade: IDomFacade = {
			getFirstChild: (node: slimdom.Node, bucket: string | null) => {
				chai.assert.equal(bucket, expectedBucket);
				return node.firstChild;
			},
			getChildNodes: (node: slimdom.Node, bucket: string | null) => {
				chai.assert.equal(bucket, expectedBucket);
				return node.childNodes;
			},
			getNextSibling: (node: slimdom.Node, bucket: string | null) => {
				chai.assert.equal(bucket, expectedBucket);
				return node.nextSibling;
			},
			getParentNode: (node: slimdom.Node, bucket: string | null) => {
				chai.assert.equal(bucket, expectedBucket);
				return node.parentNode;
			},
		} as any;

		evaluateXPathToNodes('descendant::childElement', documentNode.firstChild, testDomFacade);

		// Same for `*`
		evaluateXPathToNodes('descendant::*', documentNode.firstChild, testDomFacade);
		// Same for `element()`
		evaluateXPathToNodes('descendant::element()', documentNode.firstChild, testDomFacade);
	});
});

describe('descendant-or-self', () => {
	it('descendant part', () => {
		jsonMlMapper.parse(['someParentElement', ['someElement']], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('descendant-or-self::someElement', documentNode.documentElement),
			[documentNode.documentElement.firstChild],
		);
	});

	it('self part', () => {
		jsonMlMapper.parse(['someParentElement', ['someElement']], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'descendant-or-self::someParentElement',
				documentNode.documentElement,
			),
			[documentNode.documentElement],
		);
	});

	it('ordering of siblings', () => {
		jsonMlMapper.parse(['someParentElement', ['someElement']], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('descendant-or-self::*', documentNode.documentElement),
			[documentNode.documentElement, documentNode.documentElement.firstChild],
		);
	});

	it('ordering of deeper descendants', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someElement', ['someElement', ['someElement']]]],
			documentNode,
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes('descendant-or-self::*', documentNode.documentElement),
			[
				documentNode.documentElement,
				documentNode.documentElement.firstChild,
				documentNode.documentElement.firstChild.firstChild,
				documentNode.documentElement.firstChild.firstChild.firstChild,
			],
		);
	});

	it('ordering of descendants with complex-ish queries', () => {
		jsonMlMapper.parse(
			['root', ['a', ['a-a'], ['a-b']], ['b', ['b-a'], ['b-b']]],
			documentNode,
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'//*[name() = "root" or name() => starts-with("a") or name() => starts-with("b")]',
				documentNode,
			).map((node: Element) => node.localName),
			['root', 'a', 'a-a', 'a-b', 'b', 'b-a', 'b-b'],
		);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('descendant::*', null), 'XPDY0002');
	});
});
