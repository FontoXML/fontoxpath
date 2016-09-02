define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/operators/boolean/AndOperator',
	'fontoxml-selectors/selectors/operators/boolean/NotOperator',
	'fontoxml-selectors/selectors/operators/boolean/OrOperator'
], function (
	Specificity,
	AndOperator,
	NotOperator,
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
	describe('AndOperator.equals()', function () {
		it('returns true if compared with itself', function () {
			var and1 = new AndOperator([
					equalSelector
				]),
				and2 = and1;

			var result1 = and1.equals(and2),
			result2 = and2.equals(and1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other AndOperator', function () {
			var and1 = new AndOperator([
					equalSelector,
					equalSelector
				]),
			and2 = new AndOperator([
				equalSelector,
				equalSelector
			]);

			var result1 = and1.equals(and2),
			result2 = and2.equals(and1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with an AndOperator unequal on the first selector', function () {
			var and1 = new AndOperator([
					unequalSelector,
					equalSelector
				]),
			and2 = new AndOperator([
				unequalSelector,
				equalSelector
			]);

			var result1 = and1.equals(and2),
			result2 = and2.equals(and1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('returns false if compared with an AndOperator unequal on the second selector', function () {
			var and1 = new AndOperator([
					equalSelector,
					unequalSelector
				]),
			and2 = new AndOperator([
				equalSelector,
				unequalSelector
			]);

			var result1 = and1.equals(and2),
			result2 = and2.equals(and1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

	});

	describe('NotOperator.equals()', function () {
		it('is equal if compared with itself', function () {
			var not1 = new NotOperator(equalSelector),
			not2 = not1;

			var result1 = not1.equals(not2),
			result2 = not2.equals(not1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('is equal if compared with an equal other NotOperator', function () {
			var not1 = new NotOperator(equalSelector),
			not2 = new NotOperator(equalSelector);

			var result1 = not1.equals(not2),
			result2 = not2.equals(not1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});
	});

	describe('OrOperator.equals()', function () {
		it('returns true if compared with itself', function () {
			var or1 = new OrOperator([
					equalSelector,
					equalSelector
				]),
			or2 = or1;

			var result1 = or1.equals(or2),
			result2 = or2.equals(or1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other OrOperator', function () {
			var or1 = new OrOperator([
					equalSelector,
					equalSelector
				]),
			or2 = new OrOperator([
				equalSelector,
				equalSelector
			]);

			var result1 = or1.equals(or2),
			result2 = or2.equals(or1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other OrOperator', function () {
			var or1 = new OrOperator([
					equalSelector,
					unequalSelector
				]),
			or2 = new OrOperator([
				unequalSelector,
				equalSelector
			]);

			var result1 = or1.equals(or2),
			result2 = or2.equals(or1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
