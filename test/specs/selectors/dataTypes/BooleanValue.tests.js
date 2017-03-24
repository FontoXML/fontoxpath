import BooleanValue from 'fontoxpath/selectors/dataTypes/BooleanValue';

describe('BooleanValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is true', () => {
		const booleanValue = new BooleanValue(true);
		chai.assert.isTrue(booleanValue.getEffectiveBooleanValue());
	});

	it('returns false when the value is false', () => {
		const booleanValue = new BooleanValue(false);
		chai.assert.isFalse(booleanValue.getEffectiveBooleanValue());
	});
});

describe('BooleanValue.instanceOfType()', () => {
	it('returns true for xs:boolean', () => {
		const booleanValue = new BooleanValue();
		chai.assert.isTrue(booleanValue.instanceOfType('xs:boolean'));
	});
});
