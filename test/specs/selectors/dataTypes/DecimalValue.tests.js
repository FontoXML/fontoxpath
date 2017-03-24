import DecimalValue from 'fontoxpath/selectors/dataTypes/DecimalValue';

describe('DecimalValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is a positive number', () => {
		const decimal = new DecimalValue(10);
		chai.assert.isTrue(decimal.getEffectiveBooleanValue());
	});

	it('returns false when the value is +0', () => {
		const decimal = new DecimalValue(+0);
		chai.assert.isFalse(decimal.getEffectiveBooleanValue());
	});

	it('returns false when the value is -0', () => {
		const decimal = new DecimalValue(-0);
		chai.assert.isFalse(decimal.getEffectiveBooleanValue());
	});

	it('returns false when the value is NaN', () => {
		const decimal = new DecimalValue(NaN);
		chai.assert.isFalse(decimal.getEffectiveBooleanValue());
	});

	it('returns true when the value is a negative number', () => {
		const decimal = new DecimalValue(-10);
		chai.assert.isTrue(decimal.getEffectiveBooleanValue());
	});
});

describe('DecimalValue.instanceOfType', () => {
	it('returns true for xs:numeric', () => {
		const decimalValue = new DecimalValue();
		chai.assert.isTrue(decimalValue.instanceOfType('xs:decimal'));
	});
});
