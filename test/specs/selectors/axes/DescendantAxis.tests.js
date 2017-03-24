import DescendantAxis from 'fontoxpath/selectors/axes/DescendantAxis';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('DescendantAxis.equals()', () => {
	it('returns true if compared with itself', () => {
		const descendant1 = new DescendantAxis(equalSelector),
			descendant2 = descendant1;
		chai.assert.isTrue(descendant1.equals(descendant2));
		chai.assert.isTrue(descendant2.equals(descendant1));
	});

	it('returns true if compared with an equal other DescendantAxis', () => {
		const descendant1 = new DescendantAxis(equalSelector),
			descendant2 = new DescendantAxis(equalSelector);
		chai.assert.isTrue(descendant1.equals(descendant2));
		chai.assert.isTrue(descendant2.equals(descendant1));
	});

	it('returns false if compared with a DescendantAxis with a different subselector', () => {
		const descendant1 = new DescendantAxis(unequalSelector),
			descendant2 = new DescendantAxis(unequalSelector);
		chai.assert.isFalse(descendant1.equals(descendant2));
		chai.assert.isFalse(descendant2.equals(descendant1));
	});

	it('returns false if compared with a DescendantAxis with a different inclusiveness', () => {
		const descendant1 = new DescendantAxis(equalSelector, { inclusive: true }),
			descendant2 = new DescendantAxis(equalSelector, { inclusive: false });
		chai.assert.isFalse(descendant1.equals(descendant2));
		chai.assert.isFalse(descendant2.equals(descendant1));
	});
});
