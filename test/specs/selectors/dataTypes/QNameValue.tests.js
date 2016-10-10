define([
	'fontoxml-selectors/selectors/dataTypes/QNameValue',
	'fontoxml-selectors/selectors/dataTypes/StringValue',
], function (
	QNameValue,
	StringValue
) {
	'use strict';

	describe('QNameValue.cast', function () {
		it('casts the given value to QNameValue', function () {
			var qNameValue = new QNameValue('123');
			chai.expect(QNameValue.cast(new StringValue('123'))).to.deep.equal(qNameValue);
		});
	});

	describe('QNameValue.getEffectiveBooleanValue()', function () {
		it('Returns true if there is a value', function () {
			var qNameValue = new QNameValue('bla');
			chai.expect(qNameValue.getEffectiveBooleanValue()).to.deep.equal(true);
		});

		it('returns false if there is no value', function () {
			var qNameValue = new QNameValue('');
			chai.expect(qNameValue.getEffectiveBooleanValue()).to.deep.equal(false);
		});
	});

	describe('QNameValue.atomize', function () {
		it('returns itself', function () {
			var qNameValue = new QNameValue();
			chai.expect(qNameValue.atomize()).to.equal(qNameValue);
		});
	});

	describe('QNameValue.instanceOfType', function () {
		it('returns true for xs:QName', function () {
			var qNameValue = new QNameValue();
			chai.expect(qNameValue.instanceOfType('xs:QName')).to.equal(true);
		});
	});
});
