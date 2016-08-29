define([
	'fontoxml-selectors/selectors/tests/NodePredicateSelector'
], function (
	NodePredicateSelector
	) {
	'use strict';

	describe('NodePredicateSelector.equals()', function () {
		it('returns true if compared with itself', function () {
			var nodePredicateSelector1 = new NodePredicateSelector(function () { return; }),
				nodePredicateSelector2 = nodePredicateSelector1;

			var result1 = nodePredicateSelector1.equals(nodePredicateSelector2),
				result2 = nodePredicateSelector2.equals(nodePredicateSelector1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it.skip('it returns true if compared with an equal other NodePredicateSelector', function () {
			var nodePredicateSelector1 = new NodePredicateSelector(function () { return; }),
				nodePredicateSelector2 = new NodePredicateSelector(function () { return; });

			var result1 = nodePredicateSelector1.equals(nodePredicateSelector2),
				result2 = nodePredicateSelector2.equals(nodePredicateSelector1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other NodePredicateSelector', function () {
			var nodePredicateSelector1 = new NodePredicateSelector(function (a, b) { return; }),
				nodePredicateSelector2 = new NodePredicateSelector(function () { return; });

			var result1 = nodePredicateSelector1.equals(nodePredicateSelector2),
				result2 = nodePredicateSelector2.equals(nodePredicateSelector1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});

});
