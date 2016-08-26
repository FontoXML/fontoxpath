define([
	'fontoxml-selectors/selectors/dataTypes/FloatValue'
], function (
	FloatValue
	) {
	'use strict';

	describe('FloatValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is a positive number', function () {
			var float = new FloatValue(10.12);
			var result = float.getEffectiveBooleanValue();
			chai.expect(result).to.equal(true);
		});

		it('returns false when the value is +0', function () {
			var float = new FloatValue(+0);
			var result = float.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns false when the value is -0', function () {
			var float = new FloatValue(-0);
			var result = float.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns false when the value is NaN', function () {
			var float = new FloatValue(NaN);
			var result = float.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns true when the value is a negative number', function () {
			var float = new FloatValue(-10.12);
			var result = float.getEffectiveBooleanValue();
			chai.expect(result).to.equal(true);
		});
	});
});
