define([
	'fontoxml-selectors/selectors/isSameArray'
], function (
	isSameArray
) {
	'use strict';

	describe('isSameArray()', function () {
		it('returns true for same arrays', function () {
			chai.expect(isSameArray([], [])).to.equal(true);
			chai.expect(isSameArray([1], [1])).to.equal(true);
			chai.expect(isSameArray([1,2], [1,2])).to.equal(true);
		});

		it('returns false for different arrays', function () {
			chai.expect(isSameArray([], [1])).to.equal(false);
			chai.expect(isSameArray([1], [1,2])).to.equal(false);
			chai.expect(isSameArray([1,2],[2,3])).to.equal(false);
		});
	});
});
