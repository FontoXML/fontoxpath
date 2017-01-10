import DoubleValue from 'fontoxpath/selectors/dataTypes/DoubleValue';
import StringValue from 'fontoxpath/selectors/dataTypes/StringValue';

describe('DoubleValue.cast()', () => {
	it('casts the given value to DoubleValue', () => {
		const doubleValue = new DoubleValue(123);
		chai.expect(DoubleValue.cast(new StringValue('123'))).to.deep.equal(doubleValue);
	});
});

describe('DoubleValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is a positive number', () => {
		const doubleValue = new DoubleValue(10.12);
		chai.expect(doubleValue.getEffectiveBooleanValue()).to.equal(true);
	});

	it('returns false when the value is +0', () => {
		const doubleValue = new DoubleValue(+0);
		chai.expect(doubleValue.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns false when the value is -0', () => {
		const doubleValue = new DoubleValue(-0);
		chai.expect(doubleValue.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns false when the value is NaN', () => {
		const doubleValue = new DoubleValue(NaN);
		chai.expect(doubleValue.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns true when the value is a negative number', () => {
		const doubleValue = new DoubleValue(-10.12);
		chai.expect(doubleValue.getEffectiveBooleanValue()).to.equal(true);
	});
});

describe('DoubleValue.instanceOfType', () => {
	it('returns true for xs:numeric', () => {
		const doubleValue = new DoubleValue();
		chai.expect(doubleValue.instanceOfType('xs:numeric')).to.equal(true);
	});
});
