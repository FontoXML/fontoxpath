import UntypedAtomicValue from 'fontoxpath/selectors/dataTypes/UntypedAtomicValue';

describe('UntypedAtomicValue.cast', () => {
	it('throws when called', () => {
		const untypedAtomicValue = new UntypedAtomicValue('123');
		chai.assert.throw(UntypedAtomicValue.cast);
	});
});

describe('UntypedAtomicValue.getEffectiveBooleanValue', () => {
	it('returns true when it has a value', () => {
		const untypedAtomicValue = new UntypedAtomicValue(['123']);
		chai.assert.isTrue(untypedAtomicValue.getEffectiveBooleanValue());
	});

	it('returns false when it has no value', () => {
		const untypedAtomicValue = new UntypedAtomicValue([]);
		chai.assert.isFalse(untypedAtomicValue.getEffectiveBooleanValue());
	});
});

describe('UntypedAtomicValue.atomize', () => {
	it('returns itself', () => {
		const untypedAtomicValue = new UntypedAtomicValue();
		chai.assert.equal(untypedAtomicValue.atomize(), untypedAtomicValue);
	});
});

describe('UntypedAtomicValue.instanceOfType', () => {
	it('returns true for xs:untypedAtomicValue', () => {
		const untypedAtomicValue = new UntypedAtomicValue();
		chai.assert.isTrue(untypedAtomicValue.instanceOfType('xs:untypedAtomic'));
	});
});
