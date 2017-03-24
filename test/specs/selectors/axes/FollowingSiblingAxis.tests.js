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
		chai.assert.isTrue(followSibling1.equals(followSibling2));
		chai.assert.isTrue(followSibling2.equals(followSibling1));
	});

	it('returns true if compared with an equal other FollowingSiblingAxis', () => {
		const followSibling1 = new FollowingSiblingAxis(equalSelector),
			followSibling2 = new FollowingSiblingAxis(equalSelector);
		chai.assert.isTrue(followSibling1.equals(followSibling2));
		chai.assert.isTrue(followSibling2.equals(followSibling1));
	});

	it('returns false if compared with an unequal other FollowingSiblingAxis', () => {
		const followSibling1 = new FollowingSiblingAxis(unequalSelector),
			followSibling2 = new FollowingSiblingAxis(unequalSelector);
		chai.assert.isFalse(followSibling1.equals(followSibling2));
		chai.assert.isFalse(followSibling2.equals(followSibling1));
	});
});
