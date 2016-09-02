define([
	'fontoxml-selectors/selectors/LetExpression',
	'fontoxml-selectors/selectors/Specificity'
], function (
	LetExpression,
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

	describe('LetExpression.equals()', function () {
		it('returns true if compared with itself', function () {
			var letExpression1 = new LetExpression(
					'value',
					equalSelector,
					equalSelector),
				letExpression2 = letExpression1;

			var result1 = letExpression1.equals(letExpression2),
				result2 = letExpression2.equals(letExpression1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other LetExpression', function () {
			var letExpression1 = new LetExpression(
					'value',
					equalSelector,
					equalSelector),
				letExpression2 = new LetExpression(
					'value',
					equalSelector,
					equalSelector);

			var result1 = letExpression1.equals(letExpression2),
				result2 = letExpression2.equals(letExpression1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an LetExpression with unequal variable name', function () {
			var letExpression1 = new LetExpression(
					'value1',
					equalSelector,
					equalSelector),
				letExpression2 = new LetExpression(
					'value2',
					equalSelector,
					equalSelector);

			var result1 = letExpression1.equals(letExpression2),
				result2 = letExpression2.equals(letExpression1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with an LetExpression with unequal binding selector', function () {
			var letExpression1 = new LetExpression(
					'value',
					unequalSelector,
					equalSelector),
				letExpression2 = new LetExpression(
					'value',
					unequalSelector,
					equalSelector);

			var result1 = letExpression1.equals(letExpression2),
				result2 = letExpression2.equals(letExpression1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with an LetExpression with unequal return selector', function () {
			var letExpression1 = new LetExpression(
					'value',
					equalSelector,
					unequalSelector),
				letExpression2 = new LetExpression(
					'value',
					equalSelector,
					unequalSelector);

			var result1 = letExpression1.equals(letExpression2),
				result2 = letExpression2.equals(letExpression1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with an unequal other LetExpression', function () {
			var letExpression1 = new LetExpression(
					'value1',
					unequalSelector,
					unequalSelector),
				letExpression2 = new LetExpression(
					'value2',
					unequalSelector,
					unequalSelector);

			var result1 = letExpression1.equals(letExpression2),
				result2 = letExpression2.equals(letExpression1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
