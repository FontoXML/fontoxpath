define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/axes/FollowingSiblingAxis'
], function (
	Specificity,
	FollowingSiblingAxis
) {
	'use strict';

	describe('FollowingSiblingAxis.equals()', function () {
		it('returns true if compared with itself', function () {
			var followSibling1 = new FollowingSiblingAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				followSibling2 = followSibling1;

			var result1 = followSibling1.equals(followSibling2),
				result2 = followSibling2.equals(followSibling1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other FollowingSiblingAxis', function () {
			var followSibling1 = new FollowingSiblingAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				followSibling2 = new FollowingSiblingAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				});

			var result1 = followSibling1.equals(followSibling2),
				result2 = followSibling2.equals(followSibling1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with an unequal other FollowingSiblingAxis', function () {
			var followSibling1 = new FollowingSiblingAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(false)
				}),
				followSibling2 = new FollowingSiblingAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(false)
				});

			var result1 = followSibling1.equals(followSibling2),
				result2 = followSibling2.equals(followSibling1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
