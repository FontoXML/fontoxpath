define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/operators/boolean/OrOperator'
], function (
	Specificity,
	OrOperator
) {
	'use strict';

	var equalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(true),
			getBucket: sinon.stub().returns(null)
		},
		unequalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(false),
			getBucket: sinon.stub().returns(null)
		};

	describe('OrOperator.equals()', function () {
		it('returns true if compared with itself', function () {
			var or1 = new OrOperator([equalSelector, equalSelector]),
				or2 = or1;
			chai.expect(or1.equals(or2)).to.equal(true);
			chai.expect(or2.equals(or1)).to.equal(true);
		});

		it('it returns true if compared with an equal other OrOperator', function () {
			var or1 = new OrOperator([equalSelector, equalSelector]),
				or2 = new OrOperator([equalSelector, equalSelector]);
			chai.expect(or1.equals(or2)).to.equal(true);
			chai.expect(or2.equals(or1)).to.equal(true);
		});

		it('it returns false if compared with an unequal other OrOperator', function () {
			var or1 = new OrOperator([equalSelector, unequalSelector]),
				or2 = new OrOperator([unequalSelector, equalSelector]);
			chai.expect(or1.equals(or2)).to.equal(false);
			chai.expect(or2.equals(or1)).to.equal(false);
		});
	});
});
