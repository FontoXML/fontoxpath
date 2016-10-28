import InstanceOfOperator from 'fontoxml-selectors/selectors/operators/types/InstanceOfOperator';

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
		chai.expect(instanceOfOperator1.equals(instanceOfOperator2)).to.equal(true);
		chai.expect(instanceOfOperator2.equals(instanceOfOperator1)).to.equal(true);
	});

	it('it returns true if compared with an equal other InstanceOfOperator', () => {
		const instanceOfOperator1 = new InstanceOfOperator(equalSelector, equalSelector, '+'),
			instanceOfOperator2 = new InstanceOfOperator(equalSelector, equalSelector, '+');
		chai.expect(instanceOfOperator1.equals(instanceOfOperator2)).to.equal(true);
		chai.expect(instanceOfOperator2.equals(instanceOfOperator1)).to.equal(true);
	});

	it('it returns false if compared with an InstanceOfOperator unequal on the selector', () => {
		const instanceOfOperator1 = new InstanceOfOperator(unequalSelector, equalSelector, '+'),
			instanceOfOperator2 = new InstanceOfOperator(unequalSelector, equalSelector, '+');
		chai.expect(instanceOfOperator1.equals(instanceOfOperator2)).to.equal(false);
		chai.expect(instanceOfOperator2.equals(instanceOfOperator1)).to.equal(false);
	});

	it('it returns false if compared with an InstanceOfOperator unequal on the data type', () => {
		const instanceOfOperator1 = new InstanceOfOperator(equalSelector, unequalSelector, '+'),
			instanceOfOperator2 = new InstanceOfOperator(equalSelector, unequalSelector, '+');
		chai.expect(instanceOfOperator1.equals(instanceOfOperator2)).to.equal(false);
		chai.expect(instanceOfOperator2.equals(instanceOfOperator1)).to.equal(false);
	});

	it('it returns false if compared with an InstanceOfOperator unequal on the operator kind', () => {
		const instanceOfOperator1 = new InstanceOfOperator(equalSelector, equalSelector, '*'),
			instanceOfOperator2 = new InstanceOfOperator(equalSelector, equalSelector, '+');
		chai.expect(instanceOfOperator1.equals(instanceOfOperator2)).to.equal(false);
		chai.expect(instanceOfOperator2.equals(instanceOfOperator1)).to.equal(false);
	});

	it('it returns false if compared with an unequal other InstanceOfOperator', () => {
		const instanceOfOperator1 = new InstanceOfOperator(unequalSelector, unequalSelector, '+'),
			instanceOfOperator2 = new InstanceOfOperator(unequalSelector, unequalSelector, '+');
		chai.expect(instanceOfOperator1.equals(instanceOfOperator2)).to.equal(false);
		chai.expect(instanceOfOperator2.equals(instanceOfOperator1)).to.equal(false);
	});
});
