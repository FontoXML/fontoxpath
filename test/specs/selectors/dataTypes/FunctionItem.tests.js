import FunctionItem from 'fontoxpath/selectors/dataTypes/FunctionItem';

describe('FunctionItem.instanceOfType()', () => {
	it('returns true for "function(*)"', () => {
		const functionItem = new FunctionItem(() => {}, 'test', [], 0);
		chai.assert.isTrue(functionItem.instanceOfType('function(*)'));
	});

	it('returns true for item()', () => {
		const functionItem = new FunctionItem(() => {}, 'test', [], 0);
		chai.assert.isTrue(functionItem.instanceOfType('item()'));
	});

	it('returns false for any other value', () => {
		const functionItem = new FunctionItem(() => {}, 'test', [], 0);
		chai.assert.isFalse(functionItem.instanceOfType('any other value'));
	});
});

describe('FunctionItem.getEffectiveBooleanValue()', () => {
	it('throws when called', () => {
		var functionItem = new FunctionItem(() => {}, 'test', [], 0);
		chai.assert.throws(functionItem.getEffectiveBooleanValue, 'FORG0006');
	});
});

describe('FunctionItem.atomize()', () => {
	it('throws when called', () => {
		var functionItem = new FunctionItem(() => {}, 'test', [], 0);
		chai.assert.throws(functionItem.atomize, 'FOTY0013');
	});
});
