import BinaryNumericOperator from 'fontoxpath/selectors/operators/numeric/BinaryNumericOperator';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('BinaryNumericOperator.equals()', () => {
	it('returns true if compared with itself', () => {
		const binaryNumericOperator1 = new BinaryNumericOperator('+', equalSelector, equalSelector),
			binaryNumericOperator2 = binaryNumericOperator1;
		chai.assert.isTrue(binaryNumericOperator1.equals(binaryNumericOperator2));
		chai.assert.isTrue(binaryNumericOperator2.equals(binaryNumericOperator1));
	});

	it('it returns true if compared with an equal other BinaryNumericOperator', () => {
		const binaryNumericOperator1 = new BinaryNumericOperator('+', equalSelector, equalSelector),
			binaryNumericOperator2 = new BinaryNumericOperator('+', equalSelector, equalSelector);
		chai.assert.isTrue(binaryNumericOperator1.equals(binaryNumericOperator2));
		chai.assert.isTrue(binaryNumericOperator2.equals(binaryNumericOperator1));
	});

	it('it returns false if compared with a BinaryNumericOperator unequal on the first subselector', () => {
		const binaryNumericOperator1 = new BinaryNumericOperator('+', unequalSelector, equalSelector),
			binaryNumericOperator2 = new BinaryNumericOperator('+', unequalSelector, equalSelector);
		chai.assert.isFalse(binaryNumericOperator1.equals(binaryNumericOperator2));
		chai.assert.isFalse(binaryNumericOperator2.equals(binaryNumericOperator1));
	});

	it('it returns false if compared with a BinaryNumericOperator unequal on the operator kind', () => {
		const binaryNumericOperator1 = new BinaryNumericOperator('+', equalSelector, equalSelector),
			binaryNumericOperator2 = new BinaryNumericOperator('-', equalSelector, equalSelector);
		chai.assert.isFalse(binaryNumericOperator1.equals(binaryNumericOperator2));
		chai.assert.isFalse(binaryNumericOperator2.equals(binaryNumericOperator1));
	});

	it('it returns false if compared with a BinaryNumericOperator unequal on the second subselector', () => {
		const binaryNumericOperator1 = new BinaryNumericOperator('+', equalSelector, unequalSelector),
			binaryNumericOperator2 = new BinaryNumericOperator('+', equalSelector, unequalSelector);
		chai.assert.isFalse(binaryNumericOperator1.equals(binaryNumericOperator2));
		chai.assert.isFalse(binaryNumericOperator2.equals(binaryNumericOperator1));
	});

	it('it returns false if compared with an unequal other BinaryNumericOperator', () => {
		const binaryNumericOperator1 = new BinaryNumericOperator('+', unequalSelector, unequalSelector),
			binaryNumericOperator2 = new BinaryNumericOperator('-', unequalSelector, unequalSelector);
		chai.assert.isFalse(binaryNumericOperator1.equals(binaryNumericOperator2));
		chai.assert.isFalse(binaryNumericOperator2.equals(binaryNumericOperator1));
	});
});
