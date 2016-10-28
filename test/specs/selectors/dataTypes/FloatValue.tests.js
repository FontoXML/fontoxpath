import FloatValue from 'fontoxml-selectors/selectors/dataTypes/FloatValue';
import StringValue from 'fontoxml-selectors/selectors/dataTypes/StringValue';

describe('FloatValue.cast()', () => {
	it('casts the given value to FloatValue', () => {
		const floatValue = new FloatValue(123);
		chai.expect(FloatValue.cast(new StringValue('123'))).to.deep.equal(floatValue);
	});
});

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
