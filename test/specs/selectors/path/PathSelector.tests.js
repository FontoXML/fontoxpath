define([
	'fontoxml-selectors/selectors/path/PathSelector',
	'fontoxml-selectors/selectors/Specificity'
], function (
	PathSelector,
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

	describe('PathSelector.equals()', function () {
		it('returns true if compared with itself', function () {
			var pathSelector1 = new PathSelector([equalSelector, equalSelector]),
				pathSelector2 = pathSelector1;
			chai.expect(pathSelector1.equals(pathSelector2)).to.equal(true);
			chai.expect(pathSelector2.equals(pathSelector1)).to.equal(true);
		});

		it('it returns true if compared with an equal other PathSelector', function () {
			var pathSelector1 = new PathSelector([equalSelector, equalSelector]),
				pathSelector2 = new PathSelector([equalSelector, equalSelector]);
			chai.expect(pathSelector1.equals(pathSelector2)).to.equal(true);
			chai.expect(pathSelector2.equals(pathSelector1)).to.equal(true);
		});

		it('it returns false if compared with a PathSelector unequal for the first subSelector', function () {
			var pathSelector1 = new PathSelector([equalSelector, unequalSelector]),
				pathSelector2 = new PathSelector([equalSelector, unequalSelector]);
			chai.expect(pathSelector1.equals(pathSelector2)).to.equal(false);
			chai.expect(pathSelector2.equals(pathSelector1)).to.equal(false);
		});

		it('it returns false if compared with a PathSelector unequal for the first subSelector', function () {
			var pathSelector1 = new PathSelector([unequalSelector, equalSelector]),
				pathSelector2 = new PathSelector([unequalSelector, equalSelector]);
			chai.expect(pathSelector1.equals(pathSelector2)).to.equal(false);
			chai.expect(pathSelector2.equals(pathSelector1)).to.equal(false);
		});

		it('it returns false if compared with an unequal other PathSelector', function () {
			var pathSelector1 = new PathSelector([unequalSelector, unequalSelector]),
				pathSelector2 = new PathSelector([unequalSelector, unequalSelector]);
			chai.expect(pathSelector1.equals(pathSelector2)).to.equal(false);
			chai.expect(pathSelector2.equals(pathSelector1)).to.equal(false);
		});
	});
});
