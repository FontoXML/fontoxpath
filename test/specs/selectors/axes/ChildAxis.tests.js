define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/axes/ChildAxis'
], function (
	Specificity,
	ChildAxis
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

	describe('ChildAxis.equals()', function () {
		it('returns true if compared with itself', function () {
			var child1 = new ChildAxis(equalSelector),
				child2 = child1;

			var result1 = child1.equals(child2),
				result2 = child2.equals(child1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other ChildAxis', function () {
			var child1 = new ChildAxis(equalSelector),
				child2 = new ChildAxis(equalSelector);

			var result1 = child1.equals(child2),
				result2 = child2.equals(child1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with an unequal other ChildAxis', function () {
			var child1 = new ChildAxis(unequalSelector),
				child2 = new ChildAxis(unequalSelector);

			var result1 = child1.equals(child2),
				result2 = child2.equals(child1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
