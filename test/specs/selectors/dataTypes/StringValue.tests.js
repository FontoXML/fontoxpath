define([
	'fontoxml-selectors/selectors/dataTypes/StringValue'
], function (
	StringValue
	) {
	'use strict';

	describe('StringValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is the string "Text"', function () {
			var string = new StringValue('Text');

			var result = string.getEffectiveBooleanValue();

			chai.expect(result).to.equal(true);
		});

		it('returns false when the value is an empty string', function () {
			var string = new StringValue('');

			var result = string.getEffectiveBooleanValue();

			chai.expect(result).to.equal(false);
		});
	});
});
