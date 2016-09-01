define([
	'fontoxml-selectors/selectors/Filter',
	'fontoxml-selectors/selectors/Specificity'
], function (
	Filter,
	Specificity
) {
	'use strict';

	describe('Filter.equals()', function () {
		it('returns true if compared with itself', function () {
			var filter1 = new Filter(
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					[{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}]);
			var filter2 = filter1;

			var result1 = filter1.equals(filter2),
				result2 = filter2.equals(filter1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other Filter', function () {
			var filter1 = new Filter(
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					[{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}]);
			var filter2 = new Filter(
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					[{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}]);

			var result1 = filter1.equals(filter2),
			result2 = filter2.equals(filter1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other Filter', function () {
			var filter1 = new Filter(
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					},
					[{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					}]);
			var filter2 = new Filter(
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					},
					[{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					}]);

			var result1 = filter1.equals(filter2),
			result2 = filter2.equals(filter1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
