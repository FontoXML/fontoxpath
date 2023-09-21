import * as chai from 'chai';
import {
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	getBucketForSelector,
	IDomFacade,
} from 'fontoxpath';
import { Document, Node, parseXmlDocument } from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode: Document;
beforeEach(() => {
	documentNode = new Document();
});

describe('parent', () => {
	it('returns the parentNode', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someElement', { someAttribute: 'someValue' }]],
			documentNode,
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'parent::someParentElement',
				documentNode.documentElement.firstChild,
			),
			[documentNode.documentElement],
		);
	});

	it('returns nothing for root nodes', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someElement', { someAttribute: 'someValue' }]],
			documentNode,
		);
		chai.assert.deepEqual(evaluateXPathToNodes('parent::node()', documentNode), []);
	});

	it('returns nothing for absent parent node encore', () => {
		const xml = parseXmlDocument('<root><element /></root>');
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

	it('passes the intersecting buckets for getParentNode', () => {
		jsonMlMapper.parse(['parentElement', ['childElement']], documentNode);

		const childNode = documentNode.firstChild.firstChild;
		const expectedBucket = getBucketForSelector('self::parentElement');

		const testDomFacade: IDomFacade = {
			getParentNode: (_node: Node, bucket: string | null) => {
				chai.assert.equal(expectedBucket, bucket);
				return null;
			},
		} as any;

		evaluateXPathToFirstNode('parent::*[self::parentElement]', childNode, testDomFacade);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('parent::*', null), 'XPDY0002');
	});

	it('returns nothing when parent specified in selector does not exist', () => {
		jsonMlMapper.parse(['parentElement', ['childElement'], ['secondChild']], documentNode);

		chai.assert.deepEqual(
			evaluateXPathToNodes('/parentElement/childElement/parent::z', documentNode, {
				getChildNodes(node: Node, _bucket?: string | null): Node[] {
					return node.childNodes;
				},
				getParentNode(node: Node, _bucket?: string | null): Node | null {
					return node.parentNode;
				},
				getFirstChild(_node: Node, _bucket: string | null): Node | null {
					return null;
				},
			} as unknown as IDomFacade),
			[],
		);
	});
});
