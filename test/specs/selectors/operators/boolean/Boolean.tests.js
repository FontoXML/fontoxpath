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

	describe('AndOperator.equals()', function () {
		it('returns true if compared with itself', function () {
			var and1 = new AndOperator([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}
				]),
				and2 = and1;

			var result1 = and1.equals(and2),
				result2 = and2.equals(and1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other AndOperator', function () {
			var and1 = new AndOperator([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}
				]),
				and2 = new AndOperator([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}
				]);

			var result1 = and1.equals(and2),
				result2 = and2.equals(and1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with an unequal other AndOperator', function () {
			var and1 = new AndOperator([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					}
				]),
				and2 = new AndOperator([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					}
				]);

			var result1 = and1.equals(and2),
				result2 = and2.equals(and1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});

	describe('NotOperator.equals()', function () {
		it('is equal if compared with itself', function () {
			var not1 = new NotOperator({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				not2 = not1;

			var result1 = not1.equals(not2),
				result2 = not2.equals(not1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('is equal if compared with an equal other NotOperator', function () {
			var not1 = new NotOperator({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				not2 = new NotOperator({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				});

			var result1 = not1.equals(not2),
				result2 = not2.equals(not1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});
	});

	describe('OrOperator.equals()', function () {
		it('returns true if compared with itself', function () {
			var or1 = new OrOperator([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true),
						getBucket: function () { return null; }
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true),
						getBucket: function () { return null; }
					}
				]),
				or2 = or1;

			var result1 = or1.equals(or2),
				result2 = or2.equals(or1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other OrOperator', function () {
			var or1 = new OrOperator([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true),
						getBucket: function () { return null; }
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true),
						getBucket: function () { return null; }
					}
				]),
				or2 = new OrOperator([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true),
						getBucket: function () { return null; }
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true),
						getBucket: function () { return null; }
					}
				]);

			var result1 = or1.equals(or2),
				result2 = or2.equals(or1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other OrOperator', function () {
			var or1 = new OrOperator([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false),
						getBucket: function () { return null; }
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false),
						getBucket: function () { return null; }
					}
				]),
				or2 = new OrOperator([
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false),
						getBucket: function () { return null; }
					},
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false),
						getBucket: function () { return null; }
					}
				]);

			var result1 = or1.equals(or2),
				result2 = or2.equals(or1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
