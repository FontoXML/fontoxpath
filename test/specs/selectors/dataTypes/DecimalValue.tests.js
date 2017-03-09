import DecimalValue from 'fontoxpath/selectors/dataTypes/DecimalValue';

describe('DecimalValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is a positive number', () => {
		const decimal = new DecimalValue(10);
		chai.expect(decimal.getEffectiveBooleanValue()).to.equal(true);
	});

	it('returns false when the value is +0', () => {
		const decimal = new DecimalValue(+0);
		chai.expect(decimal.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns false when the value is -0', () => {
		const decimal = new DecimalValue(-0);
		chai.expect(decimal.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns false when the value is NaN', () => {
		const decimal = new DecimalValue(NaN);
		chai.expect(decimal.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns true when the value is a negative number', () => {
		const decimal = new DecimalValue(-10);
		chai.expect(decimal.getEffectiveBooleanValue()).to.equal(true);
	});
});

describe('DecimalValue.instanceOfType', () => {
	it('returns true for xs:numeric', () => {
		const decimalValue = new DecimalValue();
		chai.expect(decimalValue.instanceOfType('xs:decimal')).to.equal(true);
	});
});
