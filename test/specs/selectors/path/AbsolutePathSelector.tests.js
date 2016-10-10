define([
	'fontoxml-selectors/selectors/path/AbsolutePathSelector',
	'fontoxml-selectors/selectors/Specificity'
], function (
	AbsolutePathSelector,
	Specificity
) {
	'use strict';

	var equalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(true)
		},
		unequalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(false)
		};

	describe('AbsolutePathSelector.equals()', function () {
		it('returns true if compared with itself', function () {
			var absolutePathSelector1 = new AbsolutePathSelector(equalSelector),
				absolutePathSelector2 = absolutePathSelector1;
			chai.expect(absolutePathSelector1.equals(absolutePathSelector2)).to.equal(true);
			chai.expect(absolutePathSelector2.equals(absolutePathSelector1)).to.equal(true);
		});

		it('it returns true if compared with an equal other AbsolutePathSelector', function () {
			var absolutePathSelector1 = new AbsolutePathSelector(equalSelector),
				absolutePathSelector2 = new AbsolutePathSelector(equalSelector);
			chai.expect(absolutePathSelector1.equals(absolutePathSelector2)).to.equal(true);
			chai.expect(absolutePathSelector2.equals(absolutePathSelector1)).to.equal(true);
		});

		it('it returns false if compared with an unequal other AbsolutePathSelector', function () {
			var absolutePathSelector1 = new AbsolutePathSelector(unequalSelector),
				absolutePathSelector2 = new AbsolutePathSelector(unequalSelector);
			chai.expect(absolutePathSelector1.equals(absolutePathSelector2)).to.equal(false);
			chai.expect(absolutePathSelector2.equals(absolutePathSelector1)).to.equal(false);
		});
	});
});
