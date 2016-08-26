define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/axes/DescendantAxis'
], function (
	Specificity,
	DescendantAxis
) {
	'use strict';

	describe('DescendantAxis.equals()', function () {
		it('returns true if compared with itself', function () {
			var descendant1 = new DescendantAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				descendant2 = descendant1;

			var result1 = descendant1.equals(descendant2),
				result2 = descendant2.equals(descendant1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other DescendantAxis', function () {
			var descendant1 = new DescendantAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				descendant2 = new DescendantAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				});

			var result1 = descendant1.equals(descendant2),
				result2 = descendant2.equals(descendant1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with an unequal other DescendantAxis', function () {
			var descendant1 = new DescendantAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(false)
				}),
				descendant2 = new DescendantAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(false)
				});

			var result1 = descendant1.equals(descendant2),
				result2 = descendant2.equals(descendant1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
