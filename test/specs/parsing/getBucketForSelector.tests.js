import { getBucketForSelector } from 'fontoxpath';
describe('getBucketForSelector', () => {
	it('returns the correct bucket for element selectors', () => {
		chai.assert.equal(getBucketForSelector('self::element()'), 'type-1');
	});
	it('returns the correct bucket for selectors using the and operator', () => {
		chai.assert.equal(getBucketForSelector('self::element() and self::node()'), 'type-1');
	});
	it('returns the correct bucket for selectors using the and operator, first not having a bucket', () => {
		chai.assert.equal(getBucketForSelector('true() and self::element()'), 'type-1');
	});
	it('returns the correct bucket for selectors using the or operator, first not having a bucket', () => {
		chai.assert.equal(getBucketForSelector('true() or self::element()'), null);
	});
	it('returns the correct bucket for selectors using the or operator, all having the same bucket', () => {
		chai.assert.equal(getBucketForSelector('self::element() or self::element()'), 'type-1');
	});
	it('returns the correct bucket for PI selectors', () => {
		chai.assert.equal(getBucketForSelector('self::processing-instruction()'), 'type-7');
	});
	it('returns the correct bucket for named element selectors', () => {
		chai.assert.equal(getBucketForSelector('self::someElement'), 'name-someElement');
	});
	it('returns the correct bucket for text selectors', () => {
		chai.assert.equal(getBucketForSelector('self::text()'), 'type-3');
	});
});
