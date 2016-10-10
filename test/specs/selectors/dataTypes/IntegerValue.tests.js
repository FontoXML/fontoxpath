define([
	'fontoxml-selectors/selectors/dataTypes/IntegerValue',
	'fontoxml-selectors/selectors/dataTypes/StringValue'
], function (
	IntegerValue,
	StringValue
) {
	'use strict';

	describe('IntegerValue.cast()', function () {
		it('casts the given value to IntegerValue', function () {
			var integerValue = new IntegerValue(123);
			chai.expect(IntegerValue.cast(new StringValue('123'))).to.deep.equal(integerValue);
		});
	});

	describe('IntegerValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is a positive number', function () {
			var integerValue = new IntegerValue(10);
			chai.expect(integerValue.getEffectiveBooleanValue()).to.equal(true);
		});

		it('returns false when the value is +0', function () {
			var integerValue = new IntegerValue(+0);
			chai.expect(integerValue.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns false when the value is -0', function () {
			var integerValue = new IntegerValue(-0);
			chai.expect(integerValue.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns false when the value is NaN', function () {
			var integerValue = new IntegerValue(NaN);
			chai.expect(integerValue.getEffectiveBooleanValue()).to.equal(false);
		});

		it('returns true when the value is a negative number', function () {
			var integerValue = new IntegerValue(-10);
			chai.expect(integerValue.getEffectiveBooleanValue()).to.equal(true);
		});
	});

	describe('IntegerValue.instanceOfType', function () {
		it('returns true for xs:integer', function () {
			var integerValue = new IntegerValue();
			chai.expect(integerValue.instanceOfType('xs:integer')).to.equal(true);
		});
	});
});
