define([
	'fontoxml-selectors/selectors/dataTypes/BooleanValue',
	'fontoxml-selectors/selectors/dataTypes/StringValue'
], function (
	BooleanValue,
	StringValue
) {
	'use strict';

	describe('BooleanValue#getEffectiveBooleanValue()', function () {
		it('returns true when the value is true', function () {
			var boolean = new BooleanValue(true);

			var result = boolean.getEffectiveBooleanValue();

			chai.expect(result).to.equal(true);
		});

		it('returns false when the value is false', function () {
			var boolean = new BooleanValue(false);

			var result = boolean.getEffectiveBooleanValue();

			chai.expect(result).to.equal(false);
		});
	});

	describe('BooleanValue.cast()', function () {
		it('casts "true" to true', function () {
			var boolean = BooleanValue.cast(new StringValue('true'));

			chai.expect(boolean.value).to.equal(true);
		});

		it('casts "false" to false', function () {
			var boolean = BooleanValue.cast(new StringValue('false'));

			chai.expect(boolean.value).to.equal(false);
		});

		it('casts "1" to true', function () {
			var boolean = BooleanValue.cast(new StringValue('1'));

			chai.expect(boolean.value).to.equal(true);
		});

		it('casts "0" to false', function () {
			var boolean = BooleanValue.cast(new StringValue('0'));

			chai.expect(boolean.value).to.equal(false);
		});
	});
});
