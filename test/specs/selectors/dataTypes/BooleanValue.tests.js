define([
	'fontoxml-selectors/selectors/dataTypes/BooleanValue',
	'fontoxml-selectors/selectors/dataTypes/StringValue'
], function (
	BooleanValue,
	StringValue
) {
	'use strict';

	describe('BooleanValue.cast()', function () {
		it('casts "true" to true', function () {
			var booleanValue = BooleanValue.cast(new StringValue('true'));
			chai.expect(booleanValue.value).to.equal(true);
		});

		it('casts "false" to false', function () {
			var booleanValue = BooleanValue.cast(new StringValue('false'));
			chai.expect(booleanValue.value).to.equal(false);
		});

		it('casts "1" to true', function () {
			var booleanValue = BooleanValue.cast(new StringValue('1'));
			chai.expect(booleanValue.value).to.equal(true);
		});

		it('casts "0" to false', function () {
			var booleanValue = BooleanValue.cast(new StringValue('0'));
			chai.expect(booleanValue.value).to.equal(false);
		});

		it('throws when given an invalid value', function () {
			var stringValue = new StringValue('invalid');
			chai.expect(BooleanValue.cast.bind(undefined, stringValue)).to.throw();
		});
	});

	describe('BooleanValue.getEffectiveBooleanValue()', function () {
		it('returns true when the value is true', function () {
			var booleanValue = new BooleanValue(true);
			chai.expect(booleanValue.getEffectiveBooleanValue()).to.equal(true);
		});

		it('returns false when the value is false', function () {
			var booleanValue = new BooleanValue(false);
			chai.expect(booleanValue.getEffectiveBooleanValue()).to.equal(false);
		});
	});

	describe('BooleanValue.instanceOfType()', function () {
		it('returns true for xs:boolean', function () {
			var booleanValue = new BooleanValue();
			chai.expect(booleanValue.instanceOfType('xs:boolean')).to.equal(true);
		});
	});
});
