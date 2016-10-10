define([
	'fontoxml-selectors/selectors/dataTypes/DecimalValue',
	'fontoxml-selectors/selectors/dataTypes/StringValue'
], function (
	DecimalValue,
	StringValue
) {
	'use strict';

	describe('DecimalValue.cast()', function () {
		it('casts the given value to DecimalValue', function () {
			var numericValue = new DecimalValue(123);
			chai.expect(DecimalValue.cast(new StringValue('123'))).to.deep.equal(numericValue);
		});
	});

	describe('DecimalValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is a positive number', function () {
			var decimal = new DecimalValue(10);
			chai.expect(decimal.getEffectiveBooleanValue()).to.equal(true);
		});

		it('returns false when the value is +0', function () {
			var decimal = new DecimalValue(+0);
			chai.expect(decimal.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns false when the value is -0', function () {
			var decimal = new DecimalValue(-0);
			chai.expect(decimal.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns false when the value is NaN', function () {
			var decimal = new DecimalValue(NaN);
			chai.expect(decimal.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns true when the value is a negative number', function () {
			var decimal = new DecimalValue(-10);
			chai.expect(decimal.getEffectiveBooleanValue()).to.equal(true);
		});
	});

	describe('DecimalValue.instanceOfType', function () {
		it('returns true for xs:numeric', function () {
			var decimalValue = new DecimalValue();
			chai.expect(decimalValue.instanceOfType('xs:decimal')).to.equal(true);
		});
	});
});
