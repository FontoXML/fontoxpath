import DescendantAxis from 'fontoxml-selectors/selectors/axes/DescendantAxis';
import Specificity from 'fontoxml-selectors/selectors/Specificity';

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

		const result1 = descendant1.equals(descendant2),
			result2 = descendant2.equals(descendant1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns true if compared with an equal other DescendantAxis', () => {
		const descendant1 = new DescendantAxis(equalSelector),
			descendant2 = new DescendantAxis(equalSelector);

		const result1 = descendant1.equals(descendant2),
			result2 = descendant2.equals(descendant1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns false if compared with a DescendantAxis with a different subselector', () => {
		const descendant1 = new DescendantAxis(unequalSelector),
			descendant2 = new DescendantAxis(unequalSelector);

		const result1 = descendant1.equals(descendant2),
			result2 = descendant2.equals(descendant1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});

	it('returns false if compared with a DescendantAxis with a different inclusiveness', () => {
		const descendant1 = new DescendantAxis(equalSelector, {
				inclusive: true
			}),
			descendant2 = new DescendantAxis(equalSelector, {
				inclusive: false
			});

		const result1 = descendant1.equals(descendant2),
			result2 = descendant2.equals(descendant1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});
});
