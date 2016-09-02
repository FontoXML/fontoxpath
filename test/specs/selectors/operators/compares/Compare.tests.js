define([
	'fontoxml-selectors/selectors/operators/compares/Compare',
	'fontoxml-selectors/selectors/Specificity'
], function (
	Compare,
	Specificity
) {
	'use strict';

	var equalSelector =	{
			specificity: new Specificity({}),
			equals: sinon.stub().returns(true)
		},
		unequalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(false)
		};

	describe('Compare.equals()', function () {
		it('returns true if compared with itself', function () {
			var comp1 = new Compare(
					['generalCompare', 'eq'],
					equalSelector,
					equalSelector),
				comp2 = comp1;

			var result1 = comp1.equals(comp2),
				result2 = comp2.equals(comp1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other Compare', function () {
			var comp1 = new Compare(
					['generalCompare', 'eq'],
					equalSelector,
					equalSelector),
				comp2 = new Compare(
					['generalCompare', 'eq'],
					equalSelector,
					equalSelector);

			var result1 = comp1.equals(comp2),
			result2 = comp2.equals(comp1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with a Compare unequal on the first part', function () {
			var comp1 = new Compare(
					['generalCompare', 'eq'],
					unequalSelector,
					equalSelector),
			comp2 = new Compare(
				['generalCompare', 'eq'],
				unequalSelector,
				equalSelector);

			var result1 = comp1.equals(comp2),
			result2 = comp2.equals(comp1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with a Compare unequal on the second part', function () {
			var comp1 = new Compare(
					['generalCompare', 'eq'],
					equalSelector,
					unequalSelector),
			comp2 = new Compare(
				['generalCompare', 'eq'],
				equalSelector,
				unequalSelector);

			var result1 = comp1.equals(comp2),
			result2 = comp2.equals(comp1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});


		it('it returns false if compared with an unequal other Compare', function () {
			var comp1 = new Compare(
					['generalCompare', 'eq'],
					unequalSelector,
					unequalSelector),
			comp2 = new Compare(
				['generalCompare', 'eq'],
				unequalSelector,
				unequalSelector);

			var result1 = comp1.equals(comp2),
			result2 = comp2.equals(comp1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
