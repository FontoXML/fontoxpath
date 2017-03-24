import StringValue from 'fontoxpath/selectors/dataTypes/StringValue';

describe('StringValue.getEffectiveBooleanValue()', () => {
	it('returns true when the value is the string "Text"', () => {
		const string = new StringValue('Text');
		chai.assert.isTrue(string.getEffectiveBooleanValue());
	});

	it('returns false when the value is an empty string', () => {
		const string = new StringValue('');
		chai.assert.isFalse(string.getEffectiveBooleanValue());
	});
});

describe('StringValue.instanceOfType', () => {
	it('returns true for xs:string', () => {
		const stringValue = new StringValue('');
		chai.assert.isTrue(stringValue.instanceOfType('xs:string'));
	});
});
