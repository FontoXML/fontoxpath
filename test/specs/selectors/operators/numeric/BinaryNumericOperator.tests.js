define([
	'fontoxml-selectors/selectors/operators/numeric/BinaryNumericOperator',
	'fontoxml-selectors/selectors/Specificity'
], function (
	BinaryNumericOperator,
	Specificity
) {
	'use strict';

	describe('BinaryNumericOperator', function () {
		describe('equals', function () {
			it('returns true if compared with itself', function () {
				var numericOperator1 = new BinaryNumericOperator(
					'+',
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}),
					numericOperator2 = numericOperator1;

				var result1 = numericOperator1.equals(numericOperator2),
					result2 = numericOperator2.equals(numericOperator1);

				chai.expect(result1).to.equal(true);
				chai.expect(result2).to.equal(true);
			});

			it('it returns true if compared with an equal other BinaryNumericOperator', function () {
				var numericOperator1 = new BinaryNumericOperator(
						'+',
						{
							specificity: new Specificity({}),
							equals: sinon.stub().returns(true)
						},
						{
							specificity: new Specificity({}),
							equals: sinon.stub().returns(true)
						}),
					numericOperator2 = new BinaryNumericOperator(
						'+',
						{
							specificity: new Specificity({}),
							equals: sinon.stub().returns(true)
						},
						{
							specificity: new Specificity({}),
							equals: sinon.stub().returns(true)
						});

				var result1 = numericOperator1.equals(numericOperator2),
					result2 = numericOperator2.equals(numericOperator1);

				chai.expect(result1).to.equal(true);
				chai.expect(result2).to.equal(true);
			});

			it('it returns false if compared with an unequal other BinaryNumericOperator', function () {
				var numericOperator1 = new BinaryNumericOperator(
						'+',
						{
							specificity: new Specificity({}),
							equals: sinon.stub().returns(false)
						},
						{
							specificity: new Specificity({}),
							equals: sinon.stub().returns(false)
						}),
					numericOperator2 = new BinaryNumericOperator(
						'-',
						{
							specificity: new Specificity({}),
							equals: sinon.stub().returns(false)
						},
						{
							specificity: new Specificity({}),
							equals: sinon.stub().returns(false)
						});

				var result1 = numericOperator1.equals(numericOperator2),
					result2 = numericOperator2.equals(numericOperator1);

				chai.expect(result1).to.equal(false);
				chai.expect(result2).to.equal(false);
			});
		});
	});
});
