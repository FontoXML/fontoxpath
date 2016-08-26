define([
	'fontoxml-selectors/selectors/operators/numeric/Unary',
	'fontoxml-selectors/selectors/Specificity'
], function (
	Unary,
	Specificity
) {
	'use strict';

	describe('Unary.equals()', function () {
		it('returns true if compared with itself', function () {
			var unary1 = new Unary(
				'+',
				{
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				unary2 = unary1;

			var result1 = unary1.equals(unary2),
				result2 = unary2.equals(unary1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other Unary', function () {
			var unary1 = new Unary(
					'+',
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}),
				unary2 = new Unary(
					'+',
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					});

			var result1 = unary1.equals(unary2),
				result2 = unary2.equals(unary1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other Unary', function () {
			var unary1 = new Unary(
					'+',
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					}),
				unary2 = new Unary(
					'-',
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					});

			var result1 = unary1.equals(unary2),
				result2 = unary2.equals(unary1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
