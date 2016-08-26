define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/axes/ParentAxis'
], function (
	Specificity,
	ParentAxis
) {
	'use strict';

	describe('ParentAxis.equals()', function () {
		it('returns true if compared with itself', function () {
			var parent1 = new ParentAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				parent2 = parent1;

			var result1 = parent1.equals(parent2),
				result2 = parent2.equals(parent1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other ParentAxis', function () {
			var parent1 = new ParentAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				parent2 = new ParentAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				});

			var result1 = parent1.equals(parent2),
				result2 = parent2.equals(parent1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with an unequal other ParentAxis', function () {
			var parent1 = new ParentAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(false)
				}),
				parent2 = new ParentAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(false)
				});

			var result1 = parent1.equals(parent2),
				result2 = parent2.equals(parent1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
