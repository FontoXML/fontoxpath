import AnyAtomicTypeValue from 'fontoxml-selectors/selectors/dataTypes/AnyAtomicTypeValue';
import StringValue from 'fontoxml-selectors/selectors/dataTypes/StringValue';

describe('AnyAtomicTypeValue.cast()', () => {
	it('casts the given value to AnyAtomicTypeValue', () => {
		const anyAtomicTypeValue = new AnyAtomicTypeValue('123');
		chai.assert.deepEqual(AnyAtomicTypeValue.cast(new StringValue('123')), anyAtomicTypeValue);
	});
});

describe('AnyAtomicTypeValue.atomize()', () => {
	it('returns itself', () => {
		const anyAtomicTypeValue = new AnyAtomicTypeValue();
		chai.assert.equal(anyAtomicTypeValue.atomize(), anyAtomicTypeValue);
	});
});

describe('AnyAtomicTypeValue.instanceOfType()', () => {
	it('returns true for xs:anyAtomicType', () => {
		const anyAtomicTypeValue = new AnyAtomicTypeValue();
		chai.assert.isTrue(anyAtomicTypeValue.instanceOfType('xs:anyAtomicType'));
	});

	it('returns true for item()', () => {
		const anyAtomicTypeValue = new AnyAtomicTypeValue();
		chai.assert.isTrue(anyAtomicTypeValue.instanceOfType('item()'));
	});

	it('returns false for any other value', () => {
		const anyAtomicTypeValue = new AnyAtomicTypeValue();
		chai.assert.isFalse(anyAtomicTypeValue.instanceOfType('any other type'));
	});
});
