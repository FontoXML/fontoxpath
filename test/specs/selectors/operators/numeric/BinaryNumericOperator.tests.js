import BinaryNumericOperator from 'fontoxml-selectors/selectors/operators/numeric/BinaryNumericOperator';
import Specificity from 'fontoxml-selectors/selectors/Specificity';

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
		chai.expect(binaryNumericOperator1.equals(binaryNumericOperator2)).to.equal(true);
		chai.expect(binaryNumericOperator2.equals(binaryNumericOperator1)).to.equal(true);
	});

	it('it returns true if compared with an equal other BinaryNumericOperator', () => {
		const binaryNumericOperator1 = new BinaryNumericOperator('+', equalSelector, equalSelector),
			binaryNumericOperator2 = new BinaryNumericOperator('+', equalSelector, equalSelector);
		chai.expect(binaryNumericOperator1.equals(binaryNumericOperator2)).to.equal(true);
		chai.expect(binaryNumericOperator2.equals(binaryNumericOperator1)).to.equal(true);
	});

	it('it returns false if compared with a BinaryNumericOperator unequal on the first subselector', () => {
		const binaryNumericOperator1 = new BinaryNumericOperator('+', unequalSelector, equalSelector),
			binaryNumericOperator2 = new BinaryNumericOperator('+', unequalSelector, equalSelector);
		chai.expect(binaryNumericOperator1.equals(binaryNumericOperator2)).to.equal(false);
		chai.expect(binaryNumericOperator2.equals(binaryNumericOperator1)).to.equal(false);
	});

	it('it returns false if compared with a BinaryNumericOperator unequal on the operator kind', () => {
		const binaryNumericOperator1 = new BinaryNumericOperator('+', equalSelector, equalSelector),
			binaryNumericOperator2 = new BinaryNumericOperator('-', equalSelector, equalSelector);
		chai.expect(binaryNumericOperator1.equals(binaryNumericOperator2)).to.equal(false);
		chai.expect(binaryNumericOperator2.equals(binaryNumericOperator1)).to.equal(false);
	});

	it('it returns false if compared with a BinaryNumericOperator unequal on the second subselector', () => {
		const binaryNumericOperator1 = new BinaryNumericOperator('+', equalSelector, unequalSelector),
			binaryNumericOperator2 = new BinaryNumericOperator('+', equalSelector, unequalSelector);
		chai.expect(binaryNumericOperator1.equals(binaryNumericOperator2)).to.equal(false);
		chai.expect(binaryNumericOperator2.equals(binaryNumericOperator1)).to.equal(false);
	});

	it('it returns false if compared with an unequal other BinaryNumericOperator', () => {
		const binaryNumericOperator1 = new BinaryNumericOperator('+', unequalSelector, unequalSelector),
			binaryNumericOperator2 = new BinaryNumericOperator('-', unequalSelector, unequalSelector);
		chai.expect(binaryNumericOperator1.equals(binaryNumericOperator2)).to.equal(false);
		chai.expect(binaryNumericOperator2.equals(binaryNumericOperator1)).to.equal(false);
	});
});
