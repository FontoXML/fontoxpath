import SelfAxis from 'fontoxpath/selectors/axes/SelfAxis';
import Specificity from 'fontoxpath/selectors/Specificity';

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
		chai.assert.isTrue(self1.equals(self2));
		chai.assert.isTrue(self2.equals(self1));
	});

	it('returns true if compared with an equal other SelfAxis', () => {
		const self1 = new SelfAxis(equalSelector),
			self2 = new SelfAxis(equalSelector);
		chai.assert.isTrue(self1.equals(self2));
		chai.assert.isTrue(self2.equals(self1));
	});

	it('returns false if compared with an unequal other SelfAxis', () => {
		const self1 = new SelfAxis(unequalSelector),
			self2 = new SelfAxis(unequalSelector);
		chai.assert.isFalse(self1.equals(self2));
		chai.assert.isFalse(self2.equals(self1));
	});
});
