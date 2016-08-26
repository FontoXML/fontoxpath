define([
	'fontoxml-selectors/selectors/dataTypes/DecimalValue'
], function (
	DecimalValue
	) {
	'use strict';

	describe('DecimalValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is a positive number', function () {
			var decimal = new DecimalValue(10);
			var result = decimal.getEffectiveBooleanValue();
			chai.expect(result).to.equal(true);
		});

		it('returns false when the value is +0', function () {
			var decimal = new DecimalValue(+0);
			var result = decimal.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns false when the value is -0', function () {
			var decimal = new DecimalValue(-0);
			var result = decimal.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns false when the value is NaN', function () {
			var decimal = new DecimalValue(NaN);
			var result = decimal.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns true when the value is a negative number', function () {
			var decimal = new DecimalValue(-10);
			var result = decimal.getEffectiveBooleanValue();
			chai.expect(result).to.equal(true);
		});
	});
});
