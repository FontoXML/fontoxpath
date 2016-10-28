import AnyAtomicValue from 'fontoxml-selectors/selectors/dataTypes/AnyAtomicValue';
import StringValue from 'fontoxml-selectors/selectors/dataTypes/StringValue';

describe('AnyAtomicValue.cast()', () => {
	it('casts the given value to AnyAtomicValue', () => {
		const anyAtomicValue = new AnyAtomicValue('123');
		chai.expect(AnyAtomicValue.cast(new StringValue('123'))).to.deep.equal(anyAtomicValue);
	});
});

describe('AnyAtomicValue.atomize()', () => {
	it('returns itself', () => {
		const anyAtomicValue = new AnyAtomicValue();
		chai.expect(anyAtomicValue.atomize()).to.equal(anyAtomicValue);
	});
});

describe('AnyAtomicValue.instanceOfType()', () => {
	it('returns true for xs:anyAtomicType', () => {
		const anyAtomicValue = new AnyAtomicValue();
		chai.expect(anyAtomicValue.instanceOfType('xs:anyAtomicType')).to.equal(true);
	});

	it('returns true for item()', () => {
		const anyAtomicValue = new AnyAtomicValue();
		chai.expect(anyAtomicValue.instanceOfType('item()')).to.equal(true);
	});

	it('returns false for any other value', () => {
		const anyAtomicValue = new AnyAtomicValue();
		chai.expect(anyAtomicValue.instanceOfType('any other type')).to.equal(false);
	});
});
