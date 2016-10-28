import Value from 'fontoxml-selectors/selectors/dataTypes/Value';

describe('Value.getEffectiveBooleanValue()', () => {
	it('throws when getEffectiveBooleanValue is called', () => {
		const value = new Value();
		chai.expect(value.getEffectiveBooleanValue).to.throw();
	});
});

describe('Value.instanceOfType()', () => {
	it('returns true for "item()"', () => {
		const value = new Value();
		chai.expect(value.instanceOfType('item()')).to.equal(true);
	});

	it('returns false for any other value', () => {
		const value = new Value();
		chai.expect(value.instanceOfType('any other value')).to.equal(false);
	});
});
