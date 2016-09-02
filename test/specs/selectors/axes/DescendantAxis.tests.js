define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/axes/DescendantAxis'
], function (
	Specificity,
	DescendantAxis
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
	describe('DescendantAxis.equals()', function () {
		it('returns true if compared with itself', function () {
			var descendant1 = new DescendantAxis(equalSelector),
				descendant2 = descendant1;

			var result1 = descendant1.equals(descendant2),
				result2 = descendant2.equals(descendant1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other DescendantAxis', function () {
			var descendant1 = new DescendantAxis(equalSelector),
				descendant2 = new DescendantAxis(equalSelector);

			var result1 = descendant1.equals(descendant2),
				result2 = descendant2.equals(descendant1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with a DescendantAxis with a different subselector', function () {
			var descendant1 = new DescendantAxis(unequalSelector),
				descendant2 = new DescendantAxis(unequalSelector);

			var result1 = descendant1.equals(descendant2),
				result2 = descendant2.equals(descendant1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('returns false if compared with a DescendantAxis with a different subselector', function () {
			var descendant1 = new DescendantAxis(equalSelector, {inclusive: true}),
				descendant2 = new DescendantAxis(equalSelector, {inclusive: false});

			var result1 = descendant1.equals(descendant2),
				result2 = descendant2.equals(descendant1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
