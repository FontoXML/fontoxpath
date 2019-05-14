import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes, IDomFacade, getBucketsForNode
} from 'fontoxpath';
import { Element } from 'fontoxpath/types/Types';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('descendant', () => {
	it('parses descendant::', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('descendant::someElement', documentNode), [documentNode.firstChild.firstChild]);
	});

	it('passes buckets for descendant', () => {
		jsonMlMapper.parse([
			'parentElement',
			['childElement']
		], documentNode);

		const childNode = documentNode.firstChild.firstChild;

		const testDomFacade: IDomFacade = {
			getFirstChild: (node, bucket) => {
				chai.assert.notEqual(bucket, null, 'There must be a bucket passed!');
				return node.firstChild ?
					(getBucketsForNode(node.firstChild).includes(bucket) ? node.firstChild : null) :
					null;
			},
			getNextSibling: (node, bucket) => {
				chai.assert.notEqual(bucket, null, 'There must be a bucket passed!');
				return node.nextSibling ?
					(getBucketsForNode(node.nextSibling).includes(bucket) ? node.nextSibling : null) :
					null;
			}
		} as any;

		const results = evaluateXPathToNodes('descendant::childElement', documentNode.firstChild, testDomFacade);
		chai.assert.deepEqual(results, [childNode], 'ancestors');
	});
});

describe('descendant-or-self', () => {
	it('descendant part', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('descendant-or-self::someElement', documentNode.documentElement), [documentNode.documentElement.firstChild]);
	});

	it('self part', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('descendant-or-self::someParentElement', documentNode.documentElement), [documentNode.documentElement]);
	});

	it('ordering of siblings', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('descendant-or-self::*', documentNode.documentElement), [documentNode.documentElement, documentNode.documentElement.firstChild]);
	});

	it('ordering of deeper descendants', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', ['someElement', ['someElement']]]
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('descendant-or-self::*', documentNode.documentElement),
			[
				documentNode.documentElement,
				documentNode.documentElement.firstChild,
				documentNode.documentElement.firstChild.firstChild,
				documentNode.documentElement.firstChild.firstChild.firstChild
			]
		);
	});

	it('ordering of descendants with complex-ish queries', () => {
		jsonMlMapper.parse([
			'root',
			['a', ['a-a'], ['a-b']],
			['b', ['b-a'], ['b-b']]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('//*[name() = "root" or name() => starts-with("a") or name() => starts-with("b")]', documentNode).map((node: Element) => node.localName), ['root', 'a', 'a-a', 'a-b', 'b', 'b-a', 'b-b']);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('descendant::*', null), 'XPDY0002');
	});
});
