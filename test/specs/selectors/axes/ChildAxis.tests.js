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

		const result1 = child1.equals(child2),
			result2 = child2.equals(child1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns true if compared with an equal other ChildAxis', () => {
		const child1 = new ChildAxis(equalSelector),
			child2 = new ChildAxis(equalSelector);

		const result1 = child1.equals(child2),
			result2 = child2.equals(child1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns false if compared with an unequal other ChildAxis', () => {
		const child1 = new ChildAxis(unequalSelector),
			child2 = new ChildAxis(unequalSelector);

		const result1 = child1.equals(child2),
			result2 = child2.equals(child1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});
});
