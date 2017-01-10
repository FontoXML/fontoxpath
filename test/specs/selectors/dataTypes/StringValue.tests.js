import BooleanValue from 'fontoxpath/selectors/dataTypes/BooleanValue';
import StringValue from 'fontoxpath/selectors/dataTypes/StringValue';

describe('StringValue.cast()', () => {
	it('casts the given value to a StringValue', () => {
		const stringValue = new StringValue('true');
		chai.expect(StringValue.cast(new BooleanValue(true))).to.deep.equal(stringValue);
	});
});

describe('StringValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is the string "Text"', () => {
		const string = new StringValue('Text');
		chai.expect(string.getEffectiveBooleanValue()).to.equal(true);
	});

	it('returns false when the value is an empty string', () => {
		const string = new StringValue('');
		chai.expect(string.getEffectiveBooleanValue()).to.equal(false);
	});
});

describe('StringValue.instanceOfType', () => {
	it('returns true for xs:string', () => {
		const stringValue = new StringValue('');
		chai.expect(stringValue.instanceOfType('xs:string')).to.equal(true);
	});
});
