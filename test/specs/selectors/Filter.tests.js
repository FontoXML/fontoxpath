define([
	'fontoxml-selectors/selectors/Filter',
	'fontoxml-selectors/selectors/Specificity'
], function (
	Filter,
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

	describe('Filter.equals()', function () {
		it('returns true if compared with itself', function () {
			var filter1 = new Filter(
					equalSelector,
					[equalSelector]);
			var filter2 = filter1;

			var result1 = filter1.equals(filter2),
				result2 = filter2.equals(filter1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other Filter', function () {
			var filter1 = new Filter(
					equalSelector,
					[equalSelector]);
			var filter2 = new Filter(
					equalSelector,
					[equalSelector]);

			var result1 = filter1.equals(filter2),
				result2 = filter2.equals(filter1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with a Filter unequal for the first subSelector', function () {
			var filter1 = new Filter(
					unequalSelector,
					[equalSelector]);
			var filter2 = new Filter(
					unequalSelector,
					[equalSelector]);

			var result1 = filter1.equals(filter2),
				result2 = filter2.equals(filter1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with a Filter unequal for the one of the filter subselectors', function () {
			var filter1 = new Filter(
					equalSelector,
					[unequalSelector]);
			var filter2 = new Filter(
					equalSelector,
					[unequalSelector]);

			var result1 = filter1.equals(filter2),
				result2 = filter2.equals(filter1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with a Filter unequal for the second of the filter subselectors', function () {
			var filter1 = new Filter(
					equalSelector,
					[equalSelector, unequalSelector]);
			var filter2 = new Filter(
					equalSelector,
					[equalSelector, unequalSelector]);

			var result1 = filter1.equals(filter2),
				result2 = filter2.equals(filter1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with an unequal other Filter', function () {
			var filter1 = new Filter(
					unequalSelector,
					[unequalSelector]);
			var filter2 = new Filter(
					unequalSelector,
					[unequalSelector]);

			var result1 = filter1.equals(filter2),
				result2 = filter2.equals(filter1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
