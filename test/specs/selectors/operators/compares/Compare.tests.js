define([
	'fontoxml-selectors/selectors/operators/compares/Compare',
	'fontoxml-selectors/selectors/Specificity'
], function (
	Compare,
	Specificity
) {
	'use strict';

	describe('Compare.equals()', function () {
		it('Returns if the two selectors are the same', function () {
			var compareSelector1 = new Compare(
					['generalCompare', '='],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}),
				compareSelector2 = new Compare(
					['generalCompare', '='],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					});

			var result1 = compareSelector1.equals(compareSelector2),
			result2 = compareSelector2.equals(compareSelector1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

	});
});
