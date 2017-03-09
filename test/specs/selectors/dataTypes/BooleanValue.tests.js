import BooleanValue from 'fontoxpath/selectors/dataTypes/BooleanValue';

describe('BooleanValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is true', () => {
		const booleanValue = new BooleanValue(true);
		chai.expect(booleanValue.getEffectiveBooleanValue()).to.equal(true);
	});

	it('returns false when the value is false', () => {
		const booleanValue = new BooleanValue(false);
		chai.expect(booleanValue.getEffectiveBooleanValue()).to.equal(false);
	});
});

describe('BooleanValue.instanceOfType()', () => {
	it('returns true for xs:boolean', () => {
		const booleanValue = new BooleanValue();
		chai.expect(booleanValue.instanceOfType('xs:boolean')).to.equal(true);
	});
});
