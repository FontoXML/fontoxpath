define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/axes/FollowingSiblingAxis'
], function (
	Specificity,
	FollowingSiblingAxis
) {
	'use strict';

	var equalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(true)
		},
		unequalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(false)
		};

	describe('FollowingSiblingAxis.equals()', function () {
		it('returns true if compared with itself', function () {
			var followSibling1 = new FollowingSiblingAxis(equalSelector),
				followSibling2 = followSibling1;

			var result1 = followSibling1.equals(followSibling2),
				result2 = followSibling2.equals(followSibling1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other FollowingSiblingAxis', function () {
			var followSibling1 = new FollowingSiblingAxis(equalSelector),
				followSibling2 = new FollowingSiblingAxis(equalSelector);

			var result1 = followSibling1.equals(followSibling2),
				result2 = followSibling2.equals(followSibling1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with an unequal other FollowingSiblingAxis', function () {
			var followSibling1 = new FollowingSiblingAxis(unequalSelector),
				followSibling2 = new FollowingSiblingAxis(unequalSelector);

			var result1 = followSibling1.equals(followSibling2),
				result2 = followSibling2.equals(followSibling1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
