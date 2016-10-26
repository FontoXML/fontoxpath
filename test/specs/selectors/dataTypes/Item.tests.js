import Item from 'fontoxml-selectors/selectors/dataTypes/Item';

describe('Item.getEffectiveBooleanValue()', () => {
	it('throws when getEffectiveBooleanValue is called', () => {
		const item = new Item();
		chai.expect(item.getEffectiveBooleanValue).to.throw();
	});
});

describe('Item.instanceOfType()', () => {
	it('returns true for "item()"', () => {
		const item = new Item();
		chai.expect(item.instanceOfType('item()')).to.equal(true);
	});

	it('returns false for any other value', () => {
		const item = new Item();
		chai.expect(item.instanceOfType('any other value')).to.equal(false);
	});
});
