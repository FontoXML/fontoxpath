define([
	'fontoxml-selectors/selectors/dataTypes/FloatValue',
	'fontoxml-selectors/selectors/dataTypes/StringValue'
], function (
	FloatValue,
	StringValue
) {
	'use strict';

	describe('FloatValue.cast()', function () {
		it('casts the given value to FloatValue', function () {
			var floatValue = new FloatValue(123);
			chai.expect(FloatValue.cast(new StringValue('123'))).to.deep.equal(floatValue);
		});
	});

	describe('FloatValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is a positive number', function () {
			var floatValue = new FloatValue(10.12);
			chai.expect(floatValue.getEffectiveBooleanValue()).to.equal(true);
		});

		it('returns false when the value is +0', function () {
			var floatValue = new FloatValue(+0);
			chai.expect(floatValue.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns false when the value is -0', function () {
			var floatValue = new FloatValue(-0);
			chai.expect(floatValue.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns false when the value is NaN', function () {
			var floatValue = new FloatValue(NaN);
			chai.expect(floatValue.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns true when the value is a negative number', function () {
			var floatValue = new FloatValue(-10.12);
			chai.expect(floatValue.getEffectiveBooleanValue()).to.equal(true);
		});
	});

	describe('FloatValue.instanceOfType', function () {
		it('returns true for xs:float', function () {
			var floatValue = new FloatValue();
			chai.expect(floatValue.instanceOfType('xs:float')).to.equal(true);
		});
	});
});
