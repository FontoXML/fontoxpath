import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateXPathToFirstNode, getBucketForSelector, getBucketsForNode } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('self', () => {
	it('parses self::', () => {
		const element = documentNode.createElement('someElement');
		chai.assert.equal(evaluateXPathToFirstNode('self::someElement', element), element);
	});

	it('returns the correct bucket', () => {
		const element = documentNode.createElement('someElement');
		chai.assert.include(
			getBucketsForNode(element),
			getBucketForSelector('self::someElement'),
			'The self::element selector should have the matching buckets'
		);
	});

	it('returns the correct intersecting bucket', () => {
		const element = documentNode.createElement('someElement');
		chai.assert.include(
			getBucketsForNode(element),
			getBucketForSelector('self::*[self::someElement]'),
			'The self::*[self::someElement] selector should have the matching buckets'
		);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToFirstNode('self::*', null), 'XPDY0002');
	});
});
