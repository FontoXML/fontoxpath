import FollowingSiblingAxis from 'fontoxpath/selectors/axes/FollowingSiblingAxis';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('FollowingSiblingAxis.equals()', () => {
	it('returns true if compared with itself', () => {
		const followSibling1 = new FollowingSiblingAxis(equalSelector),
			followSibling2 = followSibling1;

		const result1 = followSibling1.equals(followSibling2),
			result2 = followSibling2.equals(followSibling1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns true if compared with an equal other FollowingSiblingAxis', () => {
		const followSibling1 = new FollowingSiblingAxis(equalSelector),
			followSibling2 = new FollowingSiblingAxis(equalSelector);

		const result1 = followSibling1.equals(followSibling2),
			result2 = followSibling2.equals(followSibling1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns false if compared with an unequal other FollowingSiblingAxis', () => {
		const followSibling1 = new FollowingSiblingAxis(unequalSelector),
			followSibling2 = new FollowingSiblingAxis(unequalSelector);

		const result1 = followSibling1.equals(followSibling2),
			result2 = followSibling2.equals(followSibling1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});
});
