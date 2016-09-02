define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/functions/FunctionCall',
	'fontoxml-selectors/selectors/quantified/QuantifiedExpression'
], function (
	Specificity,
	FunctionCall,
	QuantifiedExpression
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

	describe('QuantifiedExpression.equals()', function () {
		it('returns true if compared with itself', function () {
			var quantifiedExpr1 = new QuantifiedExpression(
					'every',
					[['x', new FunctionCall('true', [])]],
					equalSelector),
				quantifiedExpr2 = quantifiedExpr1;

			var result1 = quantifiedExpr1.equals(quantifiedExpr2),
				result2 = quantifiedExpr2.equals(quantifiedExpr1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other QuantifiedExpression', function () {
			var quantifiedExpr1 = new QuantifiedExpression(
					'every',
					[['x', new FunctionCall('true', [])]],
					equalSelector),
				quantifiedExpr2 = new QuantifiedExpression(
					'every',
					[['x', new FunctionCall('true', [])]],
					equalSelector);

			var result1 = quantifiedExpr1.equals(quantifiedExpr2),
				result2 = quantifiedExpr2.equals(quantifiedExpr1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with a QuantifiedExpression unequal on kind', function () {
			var quantifiedExpr1 = new QuantifiedExpression(
					'every',
					[['x', new FunctionCall('true', [])]],
					equalSelector),
				quantifiedExpr2 = new QuantifiedExpression(
					'some',
					[['x', new FunctionCall('true', [])]],
					equalSelector);

			var result1 = quantifiedExpr1.equals(quantifiedExpr2),
				result2 = quantifiedExpr2.equals(quantifiedExpr1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with a QuantifiedExpression unequal on variable name', function () {
			var quantifiedExpr1 = new QuantifiedExpression(
					'every',
					[['y', new FunctionCall('true', [])]],
					equalSelector),
				quantifiedExpr2 = new QuantifiedExpression(
					'every',
					[['x', new FunctionCall('true', [])]],
					equalSelector);

			var result1 = quantifiedExpr1.equals(quantifiedExpr2),
				result2 = quantifiedExpr2.equals(quantifiedExpr1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with a QuantifiedExpression unequal on variable value', function () {
			var quantifiedExpr1 = new QuantifiedExpression(
					'every',
					[['x', new FunctionCall('false', [])]],
					equalSelector),
				quantifiedExpr2 = new QuantifiedExpression(
					'every',
					[['x', new FunctionCall('true', [])]],
					equalSelector);

			var result1 = quantifiedExpr1.equals(quantifiedExpr2),
				result2 = quantifiedExpr2.equals(quantifiedExpr1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with a QuantifiedExpression unequal on return expression', function () {
			var quantifiedExpr1 = new QuantifiedExpression(
					'every',
					[['x', new FunctionCall('false', [])]],
					unequalSelector),
				quantifiedExpr2 = new QuantifiedExpression(
					'every',
					[['x', new FunctionCall('false', [])]],
					unequalSelector);

			var result1 = quantifiedExpr1.equals(quantifiedExpr2),
				result2 = quantifiedExpr2.equals(quantifiedExpr1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
