import isSameArray from 'fontoxpath/selectors/isSameArray';

describe('isSameArray()', () => {
	it('returns true for same arrays', () => {
		chai.assert.isTrue(isSameArray([], []));
		chai.assert.isTrue(isSameArray([1], [1]));
		chai.assert.isTrue(isSameArray([1, 2], [1, 2]));
	});

	it('returns false for different arrays', () => {
		chai.assert.isFalse(isSameArray([], [1]));
		chai.assert.isFalse(isSameArray([1], [1, 2]));
		chai.assert.isFalse(isSameArray([1, 2], [2, 3]));
	});
});
