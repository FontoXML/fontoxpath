import SelfAxis from 'fontoxml-selectors/selectors/axes/SelfAxis';
import Specificity from 'fontoxml-selectors/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('SelfAxis.equals()', () => {
	it('returns true if compared with itself', () => {
		const self1 = new SelfAxis(equalSelector),
			self2 = self1;

		const result1 = self1.equals(self2),
			result2 = self2.equals(self1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns true if compared with an equal other SelfAxis', () => {
		const self1 = new SelfAxis(equalSelector),
			self2 = new SelfAxis(equalSelector);

		const result1 = self1.equals(self2),
			result2 = self2.equals(self1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns false if compared with an unequal other SelfAxis', () => {
		const self1 = new SelfAxis(unequalSelector),
			self2 = new SelfAxis(unequalSelector);

		const result1 = self1.equals(self2),
			result2 = self2.equals(self1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});
});
