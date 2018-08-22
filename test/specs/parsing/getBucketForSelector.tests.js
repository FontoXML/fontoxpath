import chai from 'chai';
import { getBucketForSelector } from 'fontoxpath';
describe('getBucketForSelector', () => {
	it('returns the correct bucket for element expressions', () => {
		chai.assert.equal(getBucketForSelector('self::element()'), 'type-1');
	});
	it('returns the correct bucket for expressions using the and operator', () => {
		chai.assert.equal(getBucketForSelector('self::element() and self::node()'), 'type-1');
	});
	it('returns the correct bucket for expressions using the and operator, first not having a bucket', () => {
		chai.assert.equal(getBucketForSelector('true() and self::element()'), 'type-1');
	});
	it('returns the correct bucket for expressions using the or operator, first not having a bucket', () => {
		chai.assert.equal(getBucketForSelector('true() or self::element()'), null);
	});
	it('returns the correct bucket for expressions using the or operator, all having the same bucket', () => {
		chai.assert.equal(getBucketForSelector('self::element() or self::element()'), 'type-1');
	});
	it('returns the correct bucket for PI expressions', () => {
		chai.assert.equal(getBucketForSelector('self::processing-instruction()'), 'type-7');
	});
	it('returns the correct bucket for named element expressions', () => {
		chai.assert.equal(getBucketForSelector('self::someElement'), 'name-someElement');
	});
	it('returns the correct bucket for text expressions', () => {
		chai.assert.equal(getBucketForSelector('self::text()'), 'type-3');
	});
});
