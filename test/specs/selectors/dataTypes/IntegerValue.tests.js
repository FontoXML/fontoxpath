define([
	'fontoxml-selectors/selectors/dataTypes/IntegerValue'
], function (
	IntegerValue
	) {
	'use strict';

	describe('IntegerValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is a positive number', function () {
			var integer = new IntegerValue(10);
			var result = integer.getEffectiveBooleanValue();
			chai.expect(result).to.equal(true);
		});

		it('returns false when the value is +0', function () {
			var integer = new IntegerValue(+0);
			var result = integer.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns false when the value is -0', function () {
			var integer = new IntegerValue(-0);
			var result = integer.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns false when the value is NaN', function () {
			var integer = new IntegerValue(NaN);
			var result = integer.getEffectiveBooleanValue();
			chai.expect(result).to.equal(false);
		});

		it('returns true when the value is a negative number', function () {
			var integer = new IntegerValue(-10);
			var result = integer.getEffectiveBooleanValue();
			chai.expect(result).to.equal(true);
		});
	});
});
