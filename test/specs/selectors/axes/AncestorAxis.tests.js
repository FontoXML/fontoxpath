import AncestorAxis from 'fontoxpath/selectors/axes/AncestorAxis';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('AncestorAxis.equals()', () => {
	it('returns true if compared with itself', () => {
		const ancestor1 = new AncestorAxis(equalSelector),
			ancestor2 = ancestor1;

		const result1 = ancestor1.equals(ancestor2),
			result2 = ancestor2.equals(ancestor1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns true if compared with an equal other AncestorAxis', () => {
		const ancestor1 = new AncestorAxis(equalSelector),
			ancestor2 = new AncestorAxis(equalSelector);

		const result1 = ancestor1.equals(ancestor2),
			result2 = ancestor2.equals(ancestor1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns false if compared with an unequal other AncestorAxis', () => {
		const ancestor1 = new AncestorAxis(unequalSelector),
			ancestor2 = new AncestorAxis(unequalSelector);

		const result1 = ancestor1.equals(ancestor2),
			result2 = ancestor2.equals(ancestor1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});

	it('returns false if compared with an AncestorAxis unequal on inclusiveness', () => {
		const ancestor1 = new AncestorAxis(equalSelector, {
				inclusive: false
			}),
			ancestor2 = new AncestorAxis(equalSelector, {
				inclusive: true
			});

		const result1 = ancestor1.equals(ancestor2),
			result2 = ancestor2.equals(ancestor1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});
});
