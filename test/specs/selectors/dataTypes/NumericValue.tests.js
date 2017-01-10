import NumericValue from 'fontoxpath/selectors/dataTypes/NumericValue';
import StringValue from 'fontoxpath/selectors/dataTypes/StringValue';

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
