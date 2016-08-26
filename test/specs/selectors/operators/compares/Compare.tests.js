define([
	'fontoxml-selectors/selectors/operators/compares/Compare',
	'fontoxml-selectors/selectors/Specificity'
], function (
	Compare,
	Specificity
) {
	'use strict';

	describe('Compare.equals()', function () {
		it('returns true if compared with itself', function () {
			var comp1 = new Compare(
					['generalCompare', 'eq'],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}),
				comp2 = comp1;

			var result1 = comp1.equals(comp2),
				result2 = comp2.equals(comp1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other Compare', function () {
			var comp1 = new Compare(
					['generalCompare', 'eq'],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}),
				comp2 = new Compare(
					['generalCompare', 'eq'],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					});

			var result1 = comp1.equals(comp2),
				result2 = comp2.equals(comp1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other Compare', function () {
			var comp1 = new Compare(
					['generalCompare', 'eq'],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					}),
				comp2 = new Compare(
					['generalCompare', 'eq'],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					});

			var result1 = comp1.equals(comp2),
				result2 = comp2.equals(comp1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
