import QNameValue from 'fontoxpath/selectors/dataTypes/QNameValue';

describe('QNameValue.getEffectiveBooleanValue()', () => {
	it('Returns true if there is a value', () => {
		const qNameValue = new QNameValue('bla');
		chai.assert.isTrue(qNameValue.getEffectiveBooleanValue());
	});

	it('returns false if there is no value', () => {
		const qNameValue = new QNameValue('');
		chai.assert.isFalse(qNameValue.getEffectiveBooleanValue());
	});
});

describe('QNameValue.atomize', () => {
	it('returns itself', () => {
		const qNameValue = new QNameValue();
		chai.assert.equal(qNameValue.atomize(), qNameValue);
	});
});

describe('QNameValue.instanceOfType', () => {
	it('returns true for xs:QName', () => {
		const qNameValue = new QNameValue();
		chai.assert.isTrue(qNameValue.instanceOfType('xs:QName'));
	});
});
