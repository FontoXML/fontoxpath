import DecimalValue from 'fontoxml-selectors/selectors/dataTypes/DecimalValue';
import StringValue from 'fontoxml-selectors/selectors/dataTypes/StringValue';

describe('DecimalValue.cast()', () => {
	it('casts the given value to DecimalValue', () => {
		const numericValue = new DecimalValue(123);
		chai.expect(DecimalValue.cast(new StringValue('123'))).to.deep.equal(numericValue);
	});
});

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
