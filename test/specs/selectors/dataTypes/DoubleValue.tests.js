define([
	'fontoxml-selectors/selectors/dataTypes/DoubleValue',
	'fontoxml-selectors/selectors/dataTypes/StringValue'
], function (
	DoubleValue,
	StringValue
) {
	'use strict';

	describe('DoubleValue.cast()', function () {
		it('casts the given value to DoubleValue', function () {
			var doubleValue = new DoubleValue(123);
			chai.expect(DoubleValue.cast(new StringValue('123'))).to.deep.equal(doubleValue);
		});
	});

	describe('DoubleValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is a positive number', function () {
			var doubleValue = new DoubleValue(10.12);
			chai.expect(doubleValue.getEffectiveBooleanValue()).to.equal(true);
		});

		it('returns false when the value is +0', function () {
			var doubleValue = new DoubleValue(+0);
			chai.expect(doubleValue.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns false when the value is -0', function () {
			var doubleValue = new DoubleValue(-0);
			chai.expect(doubleValue.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns false when the value is NaN', function () {
			var doubleValue = new DoubleValue(NaN);
			chai.expect(doubleValue.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns true when the value is a negative number', function () {
			var doubleValue = new DoubleValue(-10.12);
			chai.expect(doubleValue.getEffectiveBooleanValue()).to.equal(true);
		});
	});

	describe('DoubleValue.instanceOfType', function () {
		it('returns true for xs:numeric', function () {
			var doubleValue = new DoubleValue();
			chai.expect(doubleValue.instanceOfType('xs:numeric')).to.equal(true);
		});
	});
});
