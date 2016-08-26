define([
	'fontoxml-selectors/selectors/dataTypes/NumericValue'
], function (
	NumericValue
	) {
	'use strict';

	describe('NumericValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is a positive number', function () {
			var numeric = new NumericValue(10);
			var result = numeric.getEffectiveBooleanValue();
			chai.expect(result).to.equal(true);
		});

		it('returns false when the value is +0', function () {
			var numeric = new NumericValue(+0);
			var result = numeric.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns false when the value is -0', function () {
			var float = new NumericValue(-0);
			var result = float.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns false when the value is NaN', function () {
			var float = new NumericValue(NaN);
			var result = float.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns true when the value is a negative number', function () {
			var numeric = new NumericValue(-10);
			var result = numeric.getEffectiveBooleanValue();
			chai.expect(result).to.equal(true);
		});
	});
});
