define([
	'fontoxml-selectors/selectors/LetExpression',
	'fontoxml-selectors/selectors/Specificity'
], function (
	LetExpression,
	Specificity
	) {
	'use strict';

	describe('LetExpression.equals()', function () {
		it('returns true if compared with itself', function () {
			var letExpression1 = new LetExpression(
				'value',
				{
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				},
				{
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				letExpression2 = letExpression1;

			var result1 = letExpression1.equals(letExpression2),
				result2 = letExpression2.equals(letExpression1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other LetExpression', function () {
			var letExpression1 = new LetExpression(
					'value',
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}),
				letExpression2 = new LetExpression(
					'value',
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					});

			var result1 = letExpression1.equals(letExpression2),
				result2 = letExpression2.equals(letExpression1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other LetExpression', function () {
			var letExpression1 = new LetExpression(
					'value1',
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					}),
				letExpression2 = new LetExpression(
					'value2',
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					});

			var result1 = letExpression1.equals(letExpression2),
				result2 = letExpression2.equals(letExpression1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
