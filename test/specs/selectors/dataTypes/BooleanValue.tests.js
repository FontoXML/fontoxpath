define([
	'fontoxml-selectors/selectors/dataTypes/BooleanValue'
], function (
	BooleanValue
	) {
	'use strict';

	describe('BooleanValue.getEffectiveBooleanValue()', function () {
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
});
