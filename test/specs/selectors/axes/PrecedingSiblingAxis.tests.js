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

		const result1 = precedingSibling1.equals(precedingSibling2),
			result2 = precedingSibling2.equals(precedingSibling1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns true if compared with an equal other PrecedingSiblingAxis', () => {
		const precedingSibling1 = new PrecedingSiblingAxis(equalSelector),
			precedingSibling2 = new PrecedingSiblingAxis(equalSelector);

		const result1 = precedingSibling1.equals(precedingSibling2),
			result2 = precedingSibling2.equals(precedingSibling1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns false if compared with an unequal other PrecedingSiblingAxis', () => {
		const precedingSibling1 = new PrecedingSiblingAxis(unequalSelector),
			precedingSibling2 = new PrecedingSiblingAxis(unequalSelector);

		const result1 = precedingSibling1.equals(precedingSibling2),
			result2 = precedingSibling2.equals(precedingSibling1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});
});
