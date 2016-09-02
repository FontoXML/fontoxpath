define([
	'fontoxml-selectors/selectors/operators/Union',
	'fontoxml-selectors/selectors/Specificity'
], function (
	Union,
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
	describe('Union.equals()', function () {
		it('returns true if compared with itself', function () {
			var numericOperator1 = new Union([
					equalSelector,
					equalSelector]),
				numericOperator2 = numericOperator1;

			var result1 = numericOperator1.equals(numericOperator2),
				result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other Union', function () {
			var numericOperator1 = new Union([
					equalSelector,
					equalSelector]),
				numericOperator2 = new Union([
					equalSelector,
					equalSelector]);

			var result1 = numericOperator1.equals(numericOperator2),
				result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with a Union unequal for the first subSelector', function () {
			var numericOperator1 = new Union([
					equalSelector,
					unequalSelector]),
				numericOperator2 = new Union([
					equalSelector,
					unequalSelector]);

			var result1 = numericOperator1.equals(numericOperator2),
				result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with a Union unequal for the first subSelector', function () {
			var numericOperator1 = new Union([
					unequalSelector,
					equalSelector]),
			numericOperator2 = new Union([
				unequalSelector,
				equalSelector]);

			var result1 = numericOperator1.equals(numericOperator2),
			result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with an unequal other Union', function () {
			var numericOperator1 = new Union([
					unequalSelector,
					unequalSelector]),
			numericOperator2 = new Union([
				unequalSelector,
				unequalSelector]);

			var result1 = numericOperator1.equals(numericOperator2),
			result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
