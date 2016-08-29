define([
	'fontoxml-selectors/selectors/tests/NodeTypeSelector'
], function (
	NodeTypeSelector
	) {
	'use strict';

	describe('NodeTypeSelector.equals()', function () {
		it('returns true if compared with itself', function () {
			var nodeTypeSelector1 = new NodeTypeSelector(1),
				nodeTypeSelector2 = nodeTypeSelector1;

			var result1 = nodeTypeSelector1.equals(nodeTypeSelector2),
				result2 = nodeTypeSelector2.equals(nodeTypeSelector1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other NodeTypeSelector', function () {
			var nodeTypeSelector1 = new NodeTypeSelector(1),
				nodeTypeSelector2 = new NodeTypeSelector(1);

			var result1 = nodeTypeSelector1.equals(nodeTypeSelector2),
				result2 = nodeTypeSelector2.equals(nodeTypeSelector1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other NodeTypeSelector', function () {
			var nodeTypeSelector1 = new NodeTypeSelector(1),
				nodeTypeSelector2 = new NodeTypeSelector(2);

			var result1 = nodeTypeSelector1.equals(nodeTypeSelector2),
				result2 = nodeTypeSelector2.equals(nodeTypeSelector1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});

});
