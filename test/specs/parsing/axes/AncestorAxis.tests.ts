import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes,
	evaluateXPathToStrings,
	getBucketForSelector,
	IDomFacade,
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('ancestor', () => {
	it('parses ancestor::', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someElement', { someAttribute: 'someValue' }]],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'ancestor::someParentElement',
				documentNode.documentElement.firstChild
			),
			[documentNode.documentElement]
		);
	});

	it('correctly sets contextSequence', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someElement', { someAttribute: 'someValue' }]],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToStrings(
				'ancestor-or-self::*/position()',
				documentNode.documentElement.firstChild
			),
			['1', '2']
		);
	});

	it('passes buckets for ancestor', () => {
		jsonMlMapper.parse(['parentElement', ['childElement']], documentNode);

		let expectedBucket = getBucketForSelector('self::element()');
		const testDomFacade: IDomFacade = {
			getParentNode: (node: slimdom.Node, bucket: string | null) => {
				chai.assert.equal(bucket, expectedBucket);
				return null;
			},
		} as any;

		const childNode = documentNode.firstChild.firstChild;
		evaluateXPathToNodes('ancestor::parentElement', childNode, testDomFacade);

		expectedBucket = null;
		evaluateXPathToNodes('ancestor::*', childNode, testDomFacade);
	});

	it('can move up more than a single step', () => {
		jsonMlMapper.parse(
			['works', ['employee'], ['employee', ['overtime', ['day'], ['day']]]],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes('/works/employee/overtime/day/ancestor::employee', documentNode),
			[documentNode.documentElement.lastChild]
		);
	});
});

describe('ancestor-or-self', () => {
	it('parses ancestor-or-self:: ancestor part', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someElement', { someAttribute: 'someValue' }]],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'ancestor-or-self::someParentElement',
				documentNode.documentElement.firstChild
			),
			[documentNode.documentElement]
		);
	});
	it('parses ancestor-or-self:: self part', () => {
		jsonMlMapper.parse(
			['someParentElement', ['someElement', { someAttribute: 'someValue' }]],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'ancestor-or-self::someParentElement',
				documentNode.documentElement
			),
			[documentNode.documentElement]
		);
	});
	it('orders self before all ancestors', () => {
		jsonMlMapper.parse(['someParentElement', ['someElement']], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('ancestor-or-self::*', documentNode.documentElement.firstChild),
			[documentNode.documentElement, documentNode.documentElement.firstChild]
		);
	});

	it('sets the context sequence', () => {
		jsonMlMapper.parse(['someParentElement', ['someElement']], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('//someElement/ancestor::*[last()]', documentNode),
			[documentNode.documentElement]
		);
	});

	it('can move up more than a single step', () => {
		jsonMlMapper.parse(
			['works', ['employee'], ['employee', ['overtime', ['day', 'text'], ['day']]]],
			documentNode
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'/works/employee/overtime/day/ancestor-or-self::employee',
				documentNode
			),
			[documentNode.documentElement.lastChild]
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'/works/employee/overtime/day/text()/ancestor-or-self::text()',
				documentNode
			),
			[documentNode.documentElement.lastChild.firstChild.firstChild.firstChild]
		);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'/works/employee/overtime/day/ancestor-or-self::document-node()',
				documentNode
			),
			[documentNode]
		);
	});
});
