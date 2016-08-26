define([
	'fontoxml-selectors/selectors/operators/Union',
	'fontoxml-selectors/selectors/Specificity'
], function (
	Union,
	Specificity
) {
	'use strict';

	describe('Union.equals()', function () {
		it('returns true if compared with itself', function () {
			var numericOperator1 = new Union([
				{
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				},
				{
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}]),
				numericOperator2 = numericOperator1;

			var result1 = numericOperator1.equals(numericOperator2),
				result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other Union', function () {
			var numericOperator1 = new Union([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}]),
				numericOperator2 = new Union([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}]);

			var result1 = numericOperator1.equals(numericOperator2),
				result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other Union', function () {
			var numericOperator1 = new Union([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					}]),
				numericOperator2 = new Union([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					}]);

			var result1 = numericOperator1.equals(numericOperator2),
				result2 = numericOperator2.equals(numericOperator1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
