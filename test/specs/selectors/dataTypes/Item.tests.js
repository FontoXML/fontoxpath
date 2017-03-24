import Item from 'fontoxpath/selectors/dataTypes/Item';

describe('Item.getEffectiveBooleanValue()', () => {
	it('throws when getEffectiveBooleanValue is called', () => {
		const item = new Item();
		chai.assert.throw(item.getEffectiveBooleanValue);
	});
});

describe('Item.instanceOfType()', () => {
	it('returns true for "item()"', () => {
		const item = new Item();
		chai.assert.isTrue(item.instanceOfType('item()'));
	});

	it('returns false for any other value', () => {
		const item = new Item();
		chai.assert.isFalse(item.instanceOfType('any other value'));
	});
});
