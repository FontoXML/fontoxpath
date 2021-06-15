import * as chai from 'chai';
import {
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	getBucketForSelector,
	IDomFacade,
} from 'fontoxpath';
import { Document, Node } from 'slimdom';
import { sync } from 'slimdom-sax-parser';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = new Document();
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

	it('returns nothing for absent parent node encore', () => {
		const xml = sync('<root><element /></root>');
		const parentNode = evaluateXPathToFirstNode('parent::element()', xml);
		chai.assert.isNull(parentNode);
	});

	it('passes buckets for getParentNode', () => {
		jsonMlMapper.parse(['parentElement', ['childElement']], documentNode);

		const childNode = documentNode.firstChild.firstChild;
		const expectedBucket = getBucketForSelector('self::parentElement');

		const testDomFacade: IDomFacade = {
			getParentNode: (_node: Node, bucket: string | null) => {
				chai.assert.equal(expectedBucket, bucket);
				return null;
			},
		} as any;

		evaluateXPathToFirstNode('parent::parentElement', childNode, testDomFacade);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('parent::*', null), 'XPDY0002');
	});

	it('returns nothing when parent specified in selector does not exist', () => {
		jsonMlMapper.parse(['parentElement', ['childElement'], ['secondChild']], documentNode);

		chai.assert.deepEqual(
			evaluateXPathToNodes('/parentElement/childElement/parent::z', documentNode, {
				getParentNode(node: Node, _bucket?: string | null): Node | null {
					return node.parentNode;
				},
				getChildNodes(node: Node, _bucket?: string | null): Node[] {
					return node.childNodes;
				},
			} as unknown as IDomFacade),
			[]
		);
	});
});
