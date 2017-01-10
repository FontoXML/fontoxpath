import IntegerValue from 'fontoxpath/selectors/dataTypes/IntegerValue';
import StringValue from 'fontoxpath/selectors/dataTypes/StringValue';

describe('IntegerValue.cast()', () => {
	it('casts the given value to IntegerValue', () => {
		const integerValue = new IntegerValue(123);
		chai.expect(IntegerValue.cast(new StringValue('123'))).to.deep.equal(integerValue);
	});
});

describe('IntegerValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is a positive number', () => {
		const integerValue = new IntegerValue(10);
		chai.expect(integerValue.getEffectiveBooleanValue()).to.equal(true);
	});

	it('returns false when the value is +0', () => {
		const integerValue = new IntegerValue(+0);
		chai.expect(integerValue.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns false when the value is -0', () => {
		const integerValue = new IntegerValue(-0);
		chai.expect(integerValue.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns false when the value is NaN', () => {
		const integerValue = new IntegerValue(NaN);
		chai.expect(integerValue.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns true when the value is a negative number', () => {
		const integerValue = new IntegerValue(-10);
		chai.expect(integerValue.getEffectiveBooleanValue()).to.equal(true);
	});
});

describe('IntegerValue.instanceOfType', () => {
	it('returns true for xs:integer', () => {
		const integerValue = new IntegerValue();
		chai.expect(integerValue.instanceOfType('xs:integer')).to.equal(true);
	});
});
