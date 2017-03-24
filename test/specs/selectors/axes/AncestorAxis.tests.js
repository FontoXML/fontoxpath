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
		chai.assert.isTrue(ancestor1.equals(ancestor2));
		chai.assert.isTrue(ancestor2.equals(ancestor1));
	});

	it('returns true if compared with an equal other AncestorAxis', () => {
		const ancestor1 = new AncestorAxis(equalSelector),
			ancestor2 = new AncestorAxis(equalSelector);
		chai.assert.isTrue(ancestor1.equals(ancestor2));
		chai.assert.isTrue(ancestor2.equals(ancestor1));
	});

	it('returns false if compared with an unequal other AncestorAxis', () => {
		const ancestor1 = new AncestorAxis(unequalSelector),
			ancestor2 = new AncestorAxis(unequalSelector);
		chai.assert.isFalse(ancestor1.equals(ancestor2));
		chai.assert.isFalse(ancestor2.equals(ancestor1));
	});

	it('returns false if compared with an AncestorAxis unequal on inclusiveness', () => {
		const ancestor1 = new AncestorAxis(equalSelector, { inclusive: false }),
			ancestor2 = new AncestorAxis(equalSelector, { inclusive: true });
		chai.assert.isFalse(ancestor1.equals(ancestor2));
		chai.assert.isFalse(ancestor2.equals(ancestor1));
	});
});
