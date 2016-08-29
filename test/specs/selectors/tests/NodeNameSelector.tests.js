define([
	'fontoxml-selectors/selectors/tests/NodeNameSelector'
], function (
	NodeNameSelector
	) {
	'use strict';

	describe('NodeNameSelector.equals()', function () {
		it('returns true if compared with itself', function () {
			var nodeNameSelector1 = new NodeNameSelector('nodeName'),
				nodeNameSelector2 = nodeNameSelector1;

			var result1 = nodeNameSelector1.equals(nodeNameSelector2),
				result2 = nodeNameSelector2.equals(nodeNameSelector1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other NodeNameSelector', function () {
			var nodeNameSelector1 = new NodeNameSelector('nodeName'),
				nodeNameSelector2 = new NodeNameSelector('nodeName');

			var result1 = nodeNameSelector1.equals(nodeNameSelector2),
				result2 = nodeNameSelector2.equals(nodeNameSelector1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other NodeNameSelector', function () {
			var nodeNameSelector1 = new NodeNameSelector('nodeName1'),
				nodeNameSelector2 = new NodeNameSelector('nodeName2');

			var result1 = nodeNameSelector1.equals(nodeNameSelector2),
				result2 = nodeNameSelector2.equals(nodeNameSelector1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});

});
