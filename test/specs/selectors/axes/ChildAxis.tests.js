import ChildAxis from 'fontoxpath/selectors/axes/ChildAxis';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('ChildAxis.equals()', () => {
	it('returns true if compared with itself', () => {
		const child1 = new ChildAxis(equalSelector),
			child2 = child1;
		chai.assert.isTrue(child1.equals(child2));
		chai.assert.isTrue(child2.equals(child1));
	});

	it('returns true if compared with an equal other ChildAxis', () => {
		const child1 = new ChildAxis(equalSelector),
			child2 = new ChildAxis(equalSelector);
		chai.assert.isTrue(child1.equals(child2));
		chai.assert.isTrue(child2.equals(child1));
	});

	it('returns false if compared with an unequal other ChildAxis', () => {
		const child1 = new ChildAxis(unequalSelector),
			child2 = new ChildAxis(unequalSelector);
		chai.assert.isFalse(child1.equals(child2));
		chai.assert.isFalse(child2.equals(child1));
	});
});
