import FunctionItem from 'fontoxpath/selectors/dataTypes/FunctionItem';

describe('FunctionItem.getEffectiveBooleanValue()', () => {
	it('throws when getEffectiveBooleanValue is called', () => {
		const functionItem = new FunctionItem();
		chai.expect(functionItem.getEffectiveBooleanValue).to.throw();
	});
});

describe('FunctionItem.instanceOfType()', () => {
	it('returns true for "function(*)"', () => {
		const functionItem = new FunctionItem();
		chai.assert.isTrue(functionItem.instanceOfType('function(*)'));
	});

	it('returns true for item()', () => {
		const functionItem = new FunctionItem();
		chai.assert.isTrue(functionItem.instanceOfType('item()'));
	});

	it('returns false for any other value', () => {
		const functionItem = new FunctionItem();
		chai.assert.isFalse(functionItem.instanceOfType('any other value'));
	});
});

describe('FunctionItem.getEffectiveBooleanValue()', () => {
	it('throws when called', () => {
		var functionItem = new FunctionItem();
		chai.assert.throws(functionItem.getEffectiveBooleanValue, 'FORG0006');
	});
});

describe('FunctionItem.atomize()', () => {
	it('throws when called', () => {
		var functionItem = new FunctionItem();
		chai.assert.throws(functionItem.atomize, 'FOTY0013');
	});
});
