define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/operators/boolean/AndOperator'
], function (
	Specificity,
	AndOperator
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

	describe('AndOperator.equals()', function () {
		it('returns true if compared with itself', function () {
			var and1 = new AndOperator([equalSelector]),
				and2 = and1;
			chai.expect(and1.equals(and2)).to.equal(true);
			chai.expect(and2.equals(and1)).to.equal(true);
		});

		it('returns true if compared with an equal other AndOperator', function () {
			var and1 = new AndOperator([equalSelector, equalSelector]),
				and2 = new AndOperator([equalSelector, equalSelector]);
			chai.expect(and1.equals(and2)).to.equal(true);
			chai.expect(and2.equals(and1)).to.equal(true);
		});

		it('returns false if compared with an AndOperator unequal on the first selector', function () {
			var and1 = new AndOperator([unequalSelector, equalSelector]),
				and2 = new AndOperator([unequalSelector, equalSelector]);
			chai.expect(and1.equals(and2)).to.equal(false);
			chai.expect(and2.equals(and1)).to.equal(false);
		});

		it('returns false if compared with an AndOperator unequal on the second selector', function () {
			var and1 = new AndOperator([equalSelector, unequalSelector]),
				and2 = new AndOperator([equalSelector, unequalSelector]);
			chai.expect(and1.equals(and2)).to.equal(false);
			chai.expect(and2.equals(and1)).to.equal(false);
		});
	});
});
