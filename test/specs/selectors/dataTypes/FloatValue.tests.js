import FloatValue from 'fontoxpath/selectors/dataTypes/FloatValue';

describe('FloatValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is a positive number', () => {
		const floatValue = new FloatValue(10.12);
		chai.assert.isTrue(floatValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is +0', () => {
		const floatValue = new FloatValue(+0);
		chai.assert.isFalse(floatValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is -0', () => {
		const floatValue = new FloatValue(-0);
		chai.assert.isFalse(floatValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is NaN', () => {
		const floatValue = new FloatValue(NaN);
		chai.assert.isFalse(floatValue.getEffectiveBooleanValue());
	});

	it('returns true when the value is a negative number', () => {
		const floatValue = new FloatValue(-10.12);
		chai.assert.isTrue(floatValue.getEffectiveBooleanValue());
	});
});

describe('FloatValue.instanceOfType', () => {
	it('returns true for xs:float', () => {
		const floatValue = new FloatValue();
		chai.assert.isTrue(floatValue.instanceOfType('xs:float'));
	});
});
