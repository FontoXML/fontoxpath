import * as chai from 'chai';
import { getBucketForSelector, parseScript } from 'fontoxpath';
import { Document } from 'slimdom';

describe('getBucketForSelector', () => {
	const assertBucketForSelector = (selector, expectedBucket) => {
		// Assert selector as a string
		chai.assert.equal(getBucketForSelector(selector), expectedBucket);

		// Assert selector as an AST
		chai.assert.equal(
			getBucketForSelector(parseScript(selector, {}, new Document())),
			expectedBucket
		);
	};

	it('returns the correct bucket for element expressions', () => {
		assertBucketForSelector('self::element()', 'type-1');
	});
	it('returns the correct bucket for expressions using the and operator', () => {
		assertBucketForSelector('self::element() and self::node()', 'type-1');
	});
	it('returns the correct bucket for expressions using the and operator, first not having a bucket', () => {
		assertBucketForSelector('true() and self::element()', 'type-1');
	});
	it('returns the correct bucket for expressions using the or operator, first not having a bucket', () => {
		assertBucketForSelector('true() or self::element()', null);
	});
	it('returns the correct bucket for expressions using the or operator, all having the same bucket', () => {
		assertBucketForSelector('self::element() or self::element()', 'type-1');
	});
	it('returns the correct bucket for PI expressions', () => {
		assertBucketForSelector('self::processing-instruction()', 'type-7');
	});
	it('returns the correct bucket for named element expressions', () => {
		assertBucketForSelector('self::someElement', 'name-someElement');
	});
	it('returns the correct bucket for filter expressions', () => {
		assertBucketForSelector('(self::someElement)[@type="whatever"]', 'name-someElement');
	});
	it('returns the correct bucket for text expressions', () => {
		assertBucketForSelector('self::text()', 'type-3');
	});
});
