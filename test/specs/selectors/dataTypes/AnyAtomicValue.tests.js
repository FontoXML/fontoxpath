define([
	'fontoxml-selectors/selectors/dataTypes/AnyAtomicValue',
	'fontoxml-selectors/selectors/dataTypes/StringValue',
], function (
	AnyAtomicValue,
	StringValue
) {
	'use strict';

	describe('AnyAtomicValue.cast()', function () {
		it('casts the given value to AnyAtomicValue', function () {
			var anyAtomicValue = new AnyAtomicValue('123');
			chai.expect(AnyAtomicValue.cast(new StringValue('123'))).to.deep.equal(anyAtomicValue);
		});
	});

	describe('AnyAtomicValue.atomize()', function () {
		it('returns itself', function () {
			var anyAtomicValue = new AnyAtomicValue();
			chai.expect(anyAtomicValue.atomize()).to.equal(anyAtomicValue);
		});
	});

	describe('AnyAtomicValue.instanceOfType()', function () {
		it('returns true for xs:anyAtomicType', function () {
			var anyAtomicValue = new AnyAtomicValue();
			chai.expect(anyAtomicValue.instanceOfType('xs:anyAtomicType')).to.equal(true);
		});

		it('returns true for item()', function () {
			var anyAtomicValue = new AnyAtomicValue();
			chai.expect(anyAtomicValue.instanceOfType('item()')).to.equal(true);
		});

		it('returns false for any other value', function () {
			var anyAtomicValue = new AnyAtomicValue();
			chai.expect(anyAtomicValue.instanceOfType('any other type')).to.equal(false);
		});
	});
});
