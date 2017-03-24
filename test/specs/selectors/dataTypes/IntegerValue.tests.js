import IntegerValue from 'fontoxpath/selectors/dataTypes/IntegerValue';

describe('IntegerValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is a positive number', () => {
		const integerValue = new IntegerValue(10);
		chai.assert.isTrue(integerValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is +0', () => {
		const integerValue = new IntegerValue(+0);
		chai.assert.isFalse(integerValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is -0', () => {
		const integerValue = new IntegerValue(-0);
		chai.assert.isFalse(integerValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is NaN', () => {
		const integerValue = new IntegerValue(NaN);
		chai.assert.isFalse(integerValue.getEffectiveBooleanValue());
	});

	it('returns true when the value is a negative number', () => {
		const integerValue = new IntegerValue(-10);
		chai.assert.isTrue(integerValue.getEffectiveBooleanValue());
	});
});

describe('IntegerValue.instanceOfType', () => {
	it('returns true for xs:integer', () => {
		const integerValue = new IntegerValue();
		chai.assert.isTrue(integerValue.instanceOfType('xs:integer'));
	});
});
