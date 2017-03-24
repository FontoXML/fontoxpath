import PrecedingSiblingAxis from 'fontoxpath/selectors/axes/PrecedingSiblingAxis';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('PrecedingSiblingAxis.equals()', () => {
	it('returns true if compared with itself', () => {
		const precedingSibling1 = new PrecedingSiblingAxis(equalSelector),
			precedingSibling2 = precedingSibling1;
		chai.assert.isTrue(precedingSibling1.equals(precedingSibling2));
		chai.assert.isTrue(precedingSibling2.equals(precedingSibling1));
	});

	it('returns true if compared with an equal other PrecedingSiblingAxis', () => {
		const precedingSibling1 = new PrecedingSiblingAxis(equalSelector),
			precedingSibling2 = new PrecedingSiblingAxis(equalSelector);
		chai.assert.isTrue(precedingSibling1.equals(precedingSibling2));
		chai.assert.isTrue(precedingSibling2.equals(precedingSibling1));
	});

	it('returns false if compared with an unequal other PrecedingSiblingAxis', () => {
		const precedingSibling1 = new PrecedingSiblingAxis(unequalSelector),
			precedingSibling2 = new PrecedingSiblingAxis(unequalSelector);
		chai.assert.isFalse(precedingSibling1.equals(precedingSibling2));
		chai.assert.isFalse(precedingSibling2.equals(precedingSibling1));
	});
});
