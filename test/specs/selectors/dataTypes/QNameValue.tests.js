import QNameValue from 'fontoxpath/selectors/dataTypes/QNameValue';
import StringValue from 'fontoxpath/selectors/dataTypes/StringValue';

describe('QNameValue.cast', () => {
	it('casts the given value to QNameValue', () => {
		const qNameValue = new QNameValue('123');
		chai.expect(QNameValue.cast(new StringValue('123'))).to.deep.equal(qNameValue);
	});
});

describe('QNameValue.getEffectiveBooleanValue()', () => {
	it('Returns true if there is a value', () => {
		const qNameValue = new QNameValue('bla');
		chai.expect(qNameValue.getEffectiveBooleanValue()).to.deep.equal(true);
	});

	it('returns false if there is no value', () => {
		const qNameValue = new QNameValue('');
		chai.expect(qNameValue.getEffectiveBooleanValue()).to.deep.equal(false);
	});
});

describe('QNameValue.atomize', () => {
	it('returns itself', () => {
		const qNameValue = new QNameValue();
		chai.expect(qNameValue.atomize()).to.equal(qNameValue);
	});
});

describe('QNameValue.instanceOfType', () => {
	it('returns true for xs:QName', () => {
		const qNameValue = new QNameValue();
		chai.expect(qNameValue.instanceOfType('xs:QName')).to.equal(true);
	});
});
