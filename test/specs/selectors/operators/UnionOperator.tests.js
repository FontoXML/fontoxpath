define([
	'fontoxml-selectors/selectors/operators/Union',
	'fontoxml-selectors/selectors/Specificity'
], function (
	Union,
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

	describe('Union.equals()', function () {
		it('returns true if compared with itself', function () {
			var unionOperator1 = new Union([equalSelector, equalSelector]),
				unionOperator2 = unionOperator1;
			chai.expect(unionOperator1.equals(unionOperator2)).to.equal(true);
			chai.expect(unionOperator2.equals(unionOperator1)).to.equal(true);
		});

		it('it returns true if compared with an equal other Union', function () {
			var unionOperator1 = new Union([equalSelector, equalSelector]),
				unionOperator2 = new Union([equalSelector, equalSelector]);
			chai.expect(unionOperator1.equals(unionOperator2)).to.equal(true);
			chai.expect(unionOperator2.equals(unionOperator1)).to.equal(true);
		});

		it('it returns false if compared with a Union unequal for the first subSelector', function () {
			var unionOperator1 = new Union([equalSelector, unequalSelector]),
				unionOperator2 = new Union([equalSelector, unequalSelector]);
			chai.expect(unionOperator1.equals(unionOperator2)).to.equal(false);
			chai.expect(unionOperator2.equals(unionOperator1)).to.equal(false);
		});

		it('it returns false if compared with a Union unequal for the first subSelector', function () {
			var unionOperator1 = new Union([unequalSelector, equalSelector]),
				unionOperator2 = new Union([unequalSelector, equalSelector]);
			chai.expect(unionOperator1.equals(unionOperator2)).to.equal(false);
			chai.expect(unionOperator2.equals(unionOperator1)).to.equal(false);
		});

		it('it returns false if compared with an unequal other Union', function () {
			var unionOperator1 = new Union([unequalSelector, unequalSelector]),
				unionOperator2 = new Union([unequalSelector, unequalSelector]);
			chai.expect(unionOperator1.equals(unionOperator2)).to.equal(false);
			chai.expect(unionOperator2.equals(unionOperator1)).to.equal(false);
		});
	});
});
