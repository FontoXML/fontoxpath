import AnyAtomicTypeValue from 'fontoxpath/selectors/dataTypes/AnyAtomicTypeValue';

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
