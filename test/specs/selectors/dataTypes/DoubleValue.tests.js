define([
	'fontoxml-selectors/selectors/dataTypes/DoubleValue'
], function (
	DoubleValue
	) {
	'use strict';

	describe('DoubleValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is a positive number', function () {
			var double = new DoubleValue(10.12);
			var result = double.getEffectiveBooleanValue();
			chai.expect(result).to.equal(true);
		});

		it('returns false when the value is +0', function () {
			var double = new DoubleValue(+0);
			var result = double.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns false when the value is -0', function () {
			var double = new DoubleValue(-0);
			var result = double.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns false when the value is NaN', function () {
			var double = new DoubleValue(NaN);
			var result = double.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns true when the value is a negative number', function () {
			var double = new DoubleValue(-10.12);
			var result = double.getEffectiveBooleanValue();
			chai.expect(result).to.equal(true);
		});
	});
});
