import NumericValue from 'fontoxpath/selectors/dataTypes/NumericValue';

describe('NumericValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is a positive number', () => {
		const numericValue = new NumericValue(10);
		chai.assert.isTrue(numericValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is +0', () => {
		const numericValue = new NumericValue(+0);
		chai.assert.isFalse(numericValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is -0', () => {
		const numericValue = new NumericValue(-0);
		chai.assert.isFalse(numericValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is NaN', () => {
		const numericValue = new NumericValue(NaN);
		chai.assert.isFalse(numericValue.getEffectiveBooleanValue());
	});

	it('returns true when the value is a negative number', () => {
		const numericValue = new NumericValue(-10);
		chai.assert.isTrue(numericValue.getEffectiveBooleanValue());
	});
});
