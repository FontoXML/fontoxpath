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
		chai.assert.isTrue(parent1.equals(parent2));
		chai.assert.isTrue(parent2.equals(parent1));
	});

	it('returns true if compared with an equal other ParentAxis', () => {
		const parent1 = new ParentAxis(equalSelector),
			parent2 = new ParentAxis(equalSelector);
		chai.assert.isTrue(parent1.equals(parent2));
		chai.assert.isTrue(parent2.equals(parent1));
	});

	it('returns false if compared with an unequal other ParentAxis', () => {
		const parent1 = new ParentAxis(unequalSelector),
			parent2 = new ParentAxis(unequalSelector);
		chai.assert.isFalse(parent1.equals(parent2));
		chai.assert.isFalse(parent2.equals(parent1));
	});
});
