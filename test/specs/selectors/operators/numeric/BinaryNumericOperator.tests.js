define([
	'fontoxml-selectors/selectors/operators/numeric/BinaryNumericOperator',
	'fontoxml-selectors/selectors/Specificity'
], function (
	BinaryNumericOperator,
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

	describe('BinaryNumericOperator.equals()', function () {
		it('returns true if compared with itself', function () {
			var numericOperator1 = new BinaryNumericOperator(
					'+',
					equalSelector,
					equalSelector),
				numericOperator2 = numericOperator1;

			var result1 = numericOperator1.equals(numericOperator2),
				result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other BinaryNumericOperator', function () {
			var numericOperator1 = new BinaryNumericOperator(
					'+',
					equalSelector,
					equalSelector),
				numericOperator2 = new BinaryNumericOperator(
					'+',
					equalSelector,
					equalSelector);

			var result1 = numericOperator1.equals(numericOperator2),
				result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with a BinaryNumericOperator unequal on the first subselector', function () {
			var numericOperator1 = new BinaryNumericOperator(
					'+',
					unequalSelector,
					equalSelector),
				numericOperator2 = new BinaryNumericOperator(
					'+',
					unequalSelector,
					equalSelector);

			var result1 = numericOperator1.equals(numericOperator2),
				result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with a BinaryNumericOperator unequal on the operator kind', function () {
			var numericOperator1 = new BinaryNumericOperator(
					'+',
					equalSelector,
					equalSelector),
				numericOperator2 = new BinaryNumericOperator(
					'-',
					equalSelector,
					equalSelector);

			var result1 = numericOperator1.equals(numericOperator2),
				result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});


		it('it returns false if compared with a BinaryNumericOperator unequal on the second subselector', function () {
			var numericOperator1 = new BinaryNumericOperator(
					'+',
					equalSelector,
					unequalSelector),
				numericOperator2 = new BinaryNumericOperator(
					'+',
					equalSelector,
					unequalSelector);

			var result1 = numericOperator1.equals(numericOperator2),
				result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with an unequal other BinaryNumericOperator', function () {
			var numericOperator1 = new BinaryNumericOperator(
					'+',
					unequalSelector,
					unequalSelector),
				numericOperator2 = new BinaryNumericOperator(
					'-',
					unequalSelector,
					unequalSelector);

			var result1 = numericOperator1.equals(numericOperator2),
				result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
