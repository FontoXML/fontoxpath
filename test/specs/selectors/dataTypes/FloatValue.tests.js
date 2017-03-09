import FloatValue from 'fontoxpath/selectors/dataTypes/FloatValue';
import StringValue from 'fontoxpath/selectors/dataTypes/StringValue';

describe('FloatValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is a positive number', () => {
		const floatValue = new FloatValue(10.12);
		chai.expect(floatValue.getEffectiveBooleanValue()).to.equal(true);
	});

	it('returns false when the value is +0', () => {
		const floatValue = new FloatValue(+0);
		chai.expect(floatValue.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns false when the value is -0', () => {
		const floatValue = new FloatValue(-0);
		chai.expect(floatValue.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns false when the value is NaN', () => {
		const floatValue = new FloatValue(NaN);
		chai.expect(floatValue.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns true when the value is a negative number', () => {
		const floatValue = new FloatValue(-10.12);
		chai.expect(floatValue.getEffectiveBooleanValue()).to.equal(true);
	});
});

describe('FloatValue.instanceOfType', () => {
	it('returns true for xs:float', () => {
		const floatValue = new FloatValue();
		chai.expect(floatValue.instanceOfType('xs:float')).to.equal(true);
	});
});
