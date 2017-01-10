import ParentAxis from 'fontoxpath/selectors/axes/ParentAxis';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('ParentAxis.equals()', () => {
	it('returns true if compared with itself', () => {
		const parent1 = new ParentAxis(equalSelector),
			parent2 = parent1;

		const result1 = parent1.equals(parent2),
			result2 = parent2.equals(parent1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns true if compared with an equal other ParentAxis', () => {
		const parent1 = new ParentAxis(equalSelector),
			parent2 = new ParentAxis(equalSelector);

		const result1 = parent1.equals(parent2),
			result2 = parent2.equals(parent1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns false if compared with an unequal other ParentAxis', () => {
		const parent1 = new ParentAxis(unequalSelector),
			parent2 = new ParentAxis(unequalSelector);

		const result1 = parent1.equals(parent2),
			result2 = parent2.equals(parent1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});
});
