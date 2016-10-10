define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/operators/boolean/NotOperator'
], function (
	Specificity,
	NotOperator
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

	describe('NotOperator.equals()', function () {
		it('is equal if compared with itself', function () {
			var not1 = new NotOperator(equalSelector),
				not2 = not1;
			chai.expect(not1.equals(not2)).to.equal(true);
			chai.expect(not2.equals(not1)).to.equal(true);
		});

		it('is equal if compared with an equal other NotOperator', function () {
			var not1 = new NotOperator(equalSelector),
				not2 = new NotOperator(equalSelector);
			chai.expect(not1.equals(not2)).to.equal(true);
			chai.expect(not2.equals(not1)).to.equal(true);
		});
	});
});
