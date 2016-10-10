define([
	'fontoxml-selectors/selectors/dataTypes/StringValue',
	'fontoxml-selectors/selectors/dataTypes/StringValue'
], function (
	BooleanValue,
	StringValue
) {
	'use strict';

	describe('StringValue.cast()', function () {
		it('casts the given value to a StringValue', function () {
			var stringValue = new StringValue('true');
			chai.expect(StringValue.cast(new BooleanValue(true))).to.deep.equal(stringValue);
		});
	});

	describe('StringValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is the string "Text"', function () {
			var string = new StringValue('Text');
			chai.expect(string.getEffectiveBooleanValue()).to.equal(true);
		});

		it('returns false when the value is an empty string', function () {
			var string = new StringValue('');
			chai.expect(string.getEffectiveBooleanValue()).to.equal(false);
		});
	});

	describe('StringValue.instanceOfType', function () {
		it('returns true for xs:string', function () {
			var stringValue = new StringValue('');
			chai.expect(stringValue.instanceOfType('xs:string')).to.equal(true);
		});
	});
});
