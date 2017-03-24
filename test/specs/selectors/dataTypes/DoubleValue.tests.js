import DoubleValue from 'fontoxpath/selectors/dataTypes/DoubleValue';

describe('DoubleValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is a positive number', () => {
		const doubleValue = new DoubleValue(10.12);
		chai.assert.isTrue(doubleValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is +0', () => {
		const doubleValue = new DoubleValue(+0);
		chai.assert.isFalse(doubleValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is -0', () => {
		const doubleValue = new DoubleValue(-0);
		chai.assert.isFalse(doubleValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is NaN', () => {
		const doubleValue = new DoubleValue(NaN);
		chai.assert.isFalse(doubleValue.getEffectiveBooleanValue());
	});

	it('returns true when the value is a negative number', () => {
		const doubleValue = new DoubleValue(-10.12);
		chai.assert.isTrue(doubleValue.getEffectiveBooleanValue());
	});
});

describe('DoubleValue.instanceOfType', () => {
	it('returns true for xs:numeric', () => {
		const doubleValue = new DoubleValue();
		chai.assert.isTrue(doubleValue.instanceOfType('xs:numeric'));
	});
});
