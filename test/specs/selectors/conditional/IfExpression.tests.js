define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/functions/FunctionCall',
	'fontoxml-selectors/selectors/conditional/IfExpression'
], function (
	Specificity,
	FunctionCall,
	IfExpression
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

	describe('IfExpression.equals()', function () {
		it('returns true if compared with itself', function () {
			var quantifiedExpr1 = new IfExpression(
					equalSelector,
					equalSelector,
					equalSelector),
				quantifiedExpr2 = quantifiedExpr1;

			var result1 = quantifiedExpr1.equals(quantifiedExpr2),
				result2 = quantifiedExpr2.equals(quantifiedExpr1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other IfExpression', function () {
			var quantifiedExpr1 = new IfExpression(
					equalSelector,
					equalSelector,
					equalSelector),
				quantifiedExpr2 = new IfExpression(
					equalSelector,
					equalSelector,
					equalSelector);

			var result1 = quantifiedExpr1.equals(quantifiedExpr2),
				result2 = quantifiedExpr2.equals(quantifiedExpr1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with a IfExpression unequal on test', function () {
			var quantifiedExpr1 = new IfExpression(
					unequalSelector,
					equalSelector,
					equalSelector),
				quantifiedExpr2 = new IfExpression(
					unequalSelector,
					equalSelector,
					equalSelector);

			var result1 = quantifiedExpr1.equals(quantifiedExpr2),
				result2 = quantifiedExpr2.equals(quantifiedExpr1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with a IfExpression unequal on then', function () {
			var quantifiedExpr1 = new IfExpression(
					equalSelector,
					unequalSelector,
					equalSelector),
				quantifiedExpr2 = new IfExpression(
					equalSelector,
					unequalSelector,
					equalSelector);

			var result1 = quantifiedExpr1.equals(quantifiedExpr2),
				result2 = quantifiedExpr2.equals(quantifiedExpr1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with a IfExpression unequal on else', function () {
			var quantifiedExpr1 = new IfExpression(
					equalSelector,
					equalSelector,
					unequalSelector),
				quantifiedExpr2 = new IfExpression(
					equalSelector,
					equalSelector,
					unequalSelector);

			var result1 = quantifiedExpr1.equals(quantifiedExpr2),
				result2 = quantifiedExpr2.equals(quantifiedExpr1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
