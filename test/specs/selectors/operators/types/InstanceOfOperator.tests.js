define([
	'fontoxml-selectors/selectors/operators/types/InstanceOfOperator',
	'fontoxml-selectors/selectors/Specificity'
], function (
	InstanceOfOperator,
	Specificity
	) {
	'use strict';

	var equalSelector = {
			equals: sinon.stub().returns(true)
		},
		unequalSelector = {
			equals: sinon.stub().returns(false)
		};

	describe('InstanceOfOperator.equals()', function () {
		it('returns true if compared with itself', function () {
			var instanceOfOperator1 = new InstanceOfOperator(
				equalSelector, // Selector
				equalSelector, // Type
				''),
				instanceOfOperator2 = instanceOfOperator1;

			var result1 = instanceOfOperator1.equals(instanceOfOperator2),
				result2 = instanceOfOperator2.equals(instanceOfOperator1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other InstanceOfOperator', function () {
			var instanceOfOperator1 = new InstanceOfOperator(
					equalSelector, // Selector
					equalSelector, // Type
					'+'),
				instanceOfOperator2 = new InstanceOfOperator(
					equalSelector, // Selector
					equalSelector, // Type
					'+');

			var result1 = instanceOfOperator1.equals(instanceOfOperator2),
				result2 = instanceOfOperator2.equals(instanceOfOperator1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an InstanceOfOperator unequal on the selector', function () {
			var instanceOfOperator1 = new InstanceOfOperator(
					unequalSelector, // Selector
					equalSelector, // Type
					'+'),
				instanceOfOperator2 = new InstanceOfOperator(
					unequalSelector, // Selector
					equalSelector, // Type
					'+');

			var result1 = instanceOfOperator1.equals(instanceOfOperator2),
				result2 = instanceOfOperator2.equals(instanceOfOperator1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with an InstanceOfOperator unequal on the data type', function () {
			var instanceOfOperator1 = new InstanceOfOperator(
					equalSelector, // Selector
					unequalSelector, // Type
					'+'),
				instanceOfOperator2 = new InstanceOfOperator(
					equalSelector, // Selector
					unequalSelector, // Type
					'+');

			var result1 = instanceOfOperator1.equals(instanceOfOperator2),
				result2 = instanceOfOperator2.equals(instanceOfOperator1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with an InstanceOfOperator unequal on the operator kind', function () {
			var instanceOfOperator1 = new InstanceOfOperator(
					equalSelector, // Selector
					equalSelector, // Type
					'*'),
				instanceOfOperator2 = new InstanceOfOperator(
					equalSelector, // Selector
					equalSelector, // Type
					'+');

			var result1 = instanceOfOperator1.equals(instanceOfOperator2),
				result2 = instanceOfOperator2.equals(instanceOfOperator1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with an unequal other InstanceOfOperator', function () {
			var instanceOfOperator1 = new InstanceOfOperator(
					unequalSelector, // Selector
					unequalSelector, // Type
					'+'),
				instanceOfOperator2 = new InstanceOfOperator(
					unequalSelector, // Selector
					unequalSelector, // Type
					'+');

			var result1 = instanceOfOperator1.equals(instanceOfOperator2),
				result2 = instanceOfOperator2.equals(instanceOfOperator1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
