define([
	'fontoxml-selectors/selectors/dataTypes/Value'
], function (
	Value
) {
	'use strict';

	describe('Value.getEffectiveBooleanValue()', function () {
		it('throws when getEffectiveBooleanValue is called', function () {
			var value = new Value();
			chai.expect(value.getEffectiveBooleanValue).to.throw();
		});
	});

	describe('Value.instanceOfType()', function () {
		it('returns true for "item()"', function () {
			var value = new Value();
			chai.expect(value.instanceOfType('item()')).to.equal(true);
		});

		it('returns false for any other value', function () {
			var value = new Value();
			chai.expect(value.instanceOfType('any other value')).to.equal(false);
		});
	});
});
