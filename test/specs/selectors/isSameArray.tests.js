import isSameArray from 'fontoxml-selectors/selectors/isSameArray';

describe('isSameArray()', () => {
	it('returns true for same arrays', () => {
		chai.expect(isSameArray([], [])).to.equal(true);
		chai.expect(isSameArray([1], [1])).to.equal(true);
		chai.expect(isSameArray([1, 2], [1, 2])).to.equal(true);
	});

	it('returns false for different arrays', () => {
		chai.expect(isSameArray([], [1])).to.equal(false);
		chai.expect(isSameArray([1], [1, 2])).to.equal(false);
		chai.expect(isSameArray([1, 2], [2, 3])).to.equal(false);
	});
});
