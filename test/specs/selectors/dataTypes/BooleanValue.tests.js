import BooleanValue from 'fontoxpath/selectors/dataTypes/BooleanValue';
import StringValue from 'fontoxpath/selectors/dataTypes/StringValue';

describe('BooleanValue.cast()', () => {
	it('casts "true" to true', () => {
		const booleanValue = BooleanValue.cast(new StringValue('true'));
		chai.expect(booleanValue.value).to.equal(true);
	});

	it('casts "false" to false', () => {
		const booleanValue = BooleanValue.cast(new StringValue('false'));
		chai.expect(booleanValue.value).to.equal(false);
	});

	it('casts "1" to true', () => {
		const booleanValue = BooleanValue.cast(new StringValue('1'));
		chai.expect(booleanValue.value).to.equal(true);
	});

	it('casts "0" to false', () => {
		const booleanValue = BooleanValue.cast(new StringValue('0'));
		chai.expect(booleanValue.value).to.equal(false);
	});

	it('throws when given an invalid value', () => {
		const stringValue = new StringValue('invalid');
		chai.expect(BooleanValue.cast.bind(undefined, stringValue)).to.throw();
	});
});

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
