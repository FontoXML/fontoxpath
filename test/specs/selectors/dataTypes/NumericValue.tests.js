define([
	'fontoxml-selectors/selectors/dataTypes/NumericValue',
	'fontoxml-selectors/selectors/dataTypes/StringValue'
], function (
	NumericValue,
	StringValue
) {
	'use strict';

	describe('NumericValue.cast()', function () {
		it('casts the given value to NumericValue', function () {
			var numericValue = new NumericValue(123);
			chai.expect(NumericValue.cast(new StringValue('123'))).to.deep.equal(numericValue);
		});
	});

	describe('NumericValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is a positive number', function () {
			var numericValue = new NumericValue(10);
			chai.expect(numericValue.getEffectiveBooleanValue()).to.equal(true);
		});

		it('returns false when the value is +0', function () {
			var numericValue = new NumericValue(+0);
			chai.expect(numericValue.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns false when the value is -0', function () {
			var numericValue = new NumericValue(-0);
			chai.expect(numericValue.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns false when the value is NaN', function () {
			var numericValue = new NumericValue(NaN);
			chai.expect(numericValue.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns true when the value is a negative number', function () {
			var numericValue = new NumericValue(-10);
			chai.expect(numericValue.getEffectiveBooleanValue()).to.equal(true);
		});
	});

	describe('NumericValue.instanceOfType', function () {
		it('returns true for xs:numeric', function () {
			var numericValue = new NumericValue();
			chai.expect(numericValue.instanceOfType('xs:numeric')).to.equal(true);
		});
	});
});
