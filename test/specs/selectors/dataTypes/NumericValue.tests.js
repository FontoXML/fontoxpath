import NumericValue from 'fontoxml-selectors/selectors/dataTypes/NumericValue';
import StringValue from 'fontoxml-selectors/selectors/dataTypes/StringValue';

describe('NumericValue.cast()', () => {
	it('casts the given value to NumericValue', () => {
		const numericValue = new NumericValue(123);
		chai.expect(NumericValue.cast(new StringValue('123'))).to.deep.equal(numericValue);
	});
});

describe('NumericValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is a positive number', () => {
		const numericValue = new NumericValue(10);
		chai.expect(numericValue.getEffectiveBooleanValue()).to.equal(true);
	});

	it('returns false when the value is +0', () => {
		const numericValue = new NumericValue(+0);
		chai.expect(numericValue.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns false when the value is -0', () => {
		const numericValue = new NumericValue(-0);
		chai.expect(numericValue.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns false when the value is NaN', () => {
		const numericValue = new NumericValue(NaN);
		chai.expect(numericValue.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns true when the value is a negative number', () => {
		const numericValue = new NumericValue(-10);
		chai.expect(numericValue.getEffectiveBooleanValue()).to.equal(true);
	});
});

describe('NumericValue.instanceOfType', () => {
	it('returns true for xs:numeric', () => {
		const numericValue = new NumericValue();
		chai.expect(numericValue.instanceOfType('xs:numeric')).to.equal(true);
	});
});
