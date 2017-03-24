import InstanceOfOperator from 'fontoxpath/selectors/operators/types/InstanceOfOperator';

const equalSelector = {
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		equals: sinon.stub().returns(false)
	};

describe('InstanceOfOperator.equals()', () => {
	it('returns true if compared with itself', () => {
		const instanceOfOperator1 = new InstanceOfOperator(equalSelector, equalSelector, ''),
			instanceOfOperator2 = instanceOfOperator1;
		chai.assert.isTrue(instanceOfOperator1.equals(instanceOfOperator2));
		chai.assert.isTrue(instanceOfOperator2.equals(instanceOfOperator1));
	});

	it('it returns true if compared with an equal other InstanceOfOperator', () => {
		const instanceOfOperator1 = new InstanceOfOperator(equalSelector, equalSelector, '+'),
			instanceOfOperator2 = new InstanceOfOperator(equalSelector, equalSelector, '+');
		chai.assert.isTrue(instanceOfOperator1.equals(instanceOfOperator2));
		chai.assert.isTrue(instanceOfOperator2.equals(instanceOfOperator1));
	});

	it('it returns false if compared with an InstanceOfOperator unequal on the selector', () => {
		const instanceOfOperator1 = new InstanceOfOperator(unequalSelector, equalSelector, '+'),
			instanceOfOperator2 = new InstanceOfOperator(unequalSelector, equalSelector, '+');
		chai.assert.isFalse(instanceOfOperator1.equals(instanceOfOperator2));
		chai.assert.isFalse(instanceOfOperator2.equals(instanceOfOperator1));
	});

	it('it returns false if compared with an InstanceOfOperator unequal on the data type', () => {
		const instanceOfOperator1 = new InstanceOfOperator(equalSelector, unequalSelector, '+'),
			instanceOfOperator2 = new InstanceOfOperator(equalSelector, unequalSelector, '+');
		chai.assert.isFalse(instanceOfOperator1.equals(instanceOfOperator2));
		chai.assert.isFalse(instanceOfOperator2.equals(instanceOfOperator1));
	});

	it('it returns false if compared with an InstanceOfOperator unequal on the operator kind', () => {
		const instanceOfOperator1 = new InstanceOfOperator(equalSelector, equalSelector, '*'),
			instanceOfOperator2 = new InstanceOfOperator(equalSelector, equalSelector, '+');
		chai.assert.isFalse(instanceOfOperator1.equals(instanceOfOperator2));
		chai.assert.isFalse(instanceOfOperator2.equals(instanceOfOperator1));
	});

	it('it returns false if compared with an unequal other InstanceOfOperator', () => {
		const instanceOfOperator1 = new InstanceOfOperator(unequalSelector, unequalSelector, '+'),
			instanceOfOperator2 = new InstanceOfOperator(unequalSelector, unequalSelector, '+');
		chai.assert.isFalse(instanceOfOperator1.equals(instanceOfOperator2));
		chai.assert.isFalse(instanceOfOperator2.equals(instanceOfOperator1));
	});
});
