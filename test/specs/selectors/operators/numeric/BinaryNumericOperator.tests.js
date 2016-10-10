define([
	'fontoxml-selectors/selectors/operators/numeric/BinaryNumericOperator',
	'fontoxml-selectors/selectors/Specificity'
], function (
	BinaryNumericOperator,
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

	describe('BinaryNumericOperator.equals()', function () {
		it('returns true if compared with itself', function () {
			var binaryNumericOperator1 = new BinaryNumericOperator('+', equalSelector, equalSelector),
				binaryNumericOperator2 = binaryNumericOperator1;
			chai.expect(binaryNumericOperator1.equals(binaryNumericOperator2)).to.equal(true);
			chai.expect(binaryNumericOperator2.equals(binaryNumericOperator1)).to.equal(true);
		});

		it('it returns true if compared with an equal other BinaryNumericOperator', function () {
			var binaryNumericOperator1 = new BinaryNumericOperator('+', equalSelector, equalSelector),
				binaryNumericOperator2 = new BinaryNumericOperator('+', equalSelector, equalSelector);
			chai.expect(binaryNumericOperator1.equals(binaryNumericOperator2)).to.equal(true);
			chai.expect(binaryNumericOperator2.equals(binaryNumericOperator1)).to.equal(true);
		});

		it('it returns false if compared with a BinaryNumericOperator unequal on the first subselector', function () {
			var binaryNumericOperator1 = new BinaryNumericOperator('+', unequalSelector, equalSelector),
				binaryNumericOperator2 = new BinaryNumericOperator('+', unequalSelector, equalSelector);
			chai.expect(binaryNumericOperator1.equals(binaryNumericOperator2)).to.equal(false);
			chai.expect(binaryNumericOperator2.equals(binaryNumericOperator1)).to.equal(false);
		});

		it('it returns false if compared with a BinaryNumericOperator unequal on the operator kind', function () {
			var binaryNumericOperator1 = new BinaryNumericOperator('+', equalSelector, equalSelector),
				binaryNumericOperator2 = new BinaryNumericOperator('-', equalSelector, equalSelector);
			chai.expect(binaryNumericOperator1.equals(binaryNumericOperator2)).to.equal(false);
			chai.expect(binaryNumericOperator2.equals(binaryNumericOperator1)).to.equal(false);
		});

		it('it returns false if compared with a BinaryNumericOperator unequal on the second subselector', function () {
			var binaryNumericOperator1 = new BinaryNumericOperator('+', equalSelector, unequalSelector),
				binaryNumericOperator2 = new BinaryNumericOperator('+', equalSelector, unequalSelector);
			chai.expect(binaryNumericOperator1.equals(binaryNumericOperator2)).to.equal(false);
			chai.expect(binaryNumericOperator2.equals(binaryNumericOperator1)).to.equal(false);
		});

		it('it returns false if compared with an unequal other BinaryNumericOperator', function () {
			var binaryNumericOperator1 = new BinaryNumericOperator('+', unequalSelector, unequalSelector),
				binaryNumericOperator2 = new BinaryNumericOperator('-', unequalSelector, unequalSelector);
			chai.expect(binaryNumericOperator1.equals(binaryNumericOperator2)).to.equal(false);
			chai.expect(binaryNumericOperator2.equals(binaryNumericOperator1)).to.equal(false);
		});
	});
});
