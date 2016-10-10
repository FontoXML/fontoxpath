define([
	'fontoxml-selectors/selectors/dataTypes/UntypedAtomicValue',
	'fontoxml-selectors/selectors/dataTypes/StringValue',
], function (
	UntypedAtomicValue,
	StringValue
) {
	'use strict';

	describe('UntypedAtomicValue.cast', function () {
		it('throws when called', function () {
			var untypedAtomicValue = new UntypedAtomicValue('123');
			chai.expect(UntypedAtomicValue.cast).to.throw();
		});
	});

	describe('UntypedAtomicValue.getEffectiveBooleanValue', function () {
		it('returns true when it has a value', function () {
			var untypedAtomicValue = new UntypedAtomicValue(['123']);
			chai.expect(untypedAtomicValue.getEffectiveBooleanValue()).to.equal(true);
		});

		it('returns false when it has no value', function () {
			var untypedAtomicValue = new UntypedAtomicValue([]);
			chai.expect(untypedAtomicValue.getEffectiveBooleanValue()).to.equal(false);
		});
	});

	describe('UntypedAtomicValue.atomize', function () {
		it('returns itself', function () {
			var untypedAtomicValue = new UntypedAtomicValue();
			chai.expect(untypedAtomicValue.atomize()).to.equal(untypedAtomicValue);
		});
	});

	describe('UntypedAtomicValue.instanceOfType', function () {
		it('returns true for xs:untypedAtomicValue', function () {
			var untypedAtomicValue = new UntypedAtomicValue();
			chai.expect(untypedAtomicValue.instanceOfType('xs:untypedAtomic')).to.equal(true);
		});
	});
});
