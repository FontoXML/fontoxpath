import UntypedAtomicValue from 'fontoxpath/selectors/dataTypes/UntypedAtomicValue';

describe('UntypedAtomicValue.cast', () => {
	it('throws when called', () => {
		const untypedAtomicValue = new UntypedAtomicValue('123');
		chai.expect(UntypedAtomicValue.cast).to.throw();
	});
});

describe('UntypedAtomicValue.getEffectiveBooleanValue', () => {
	it('returns true when it has a value', () => {
		const untypedAtomicValue = new UntypedAtomicValue(['123']);
		chai.expect(untypedAtomicValue.getEffectiveBooleanValue()).to.equal(true);
	});

	it('returns false when it has no value', () => {
		const untypedAtomicValue = new UntypedAtomicValue([]);
		chai.expect(untypedAtomicValue.getEffectiveBooleanValue()).to.equal(false);
	});
});

describe('UntypedAtomicValue.atomize', () => {
	it('returns itself', () => {
		const untypedAtomicValue = new UntypedAtomicValue();
		chai.expect(untypedAtomicValue.atomize()).to.equal(untypedAtomicValue);
	});
});

describe('UntypedAtomicValue.instanceOfType', () => {
	it('returns true for xs:untypedAtomicValue', () => {
		const untypedAtomicValue = new UntypedAtomicValue();
		chai.expect(untypedAtomicValue.instanceOfType('xs:untypedAtomic')).to.equal(true);
	});
});
